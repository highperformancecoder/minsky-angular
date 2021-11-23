import {
  ActiveWindow,
  green,
  red,
  rendererAppName,
  rendererAppURL,
} from '@minsky/shared';
import * as debug from 'debug';
import { BrowserWindow, dialog, screen, shell } from 'electron';
import * as log from 'electron-log';
import { join } from 'path';
import { format } from 'url';
import { CommandsManager } from './commandsManager';
import { HelpFilesManager } from './HelpFilesManager';
import { MenuManager } from './menuManager';
import { RecentFilesManager } from './recentFilesManager';
import { RestServiceManager } from './restServiceManager';
import { StoreManager } from './storeManager';
import { Utility } from './utility';
import { WindowManager } from './windowManager';

const logWindows = debug('minsky:electron_windows');

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      App.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    const choice = dialog.showMessageBoxSync(App.mainWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?',
    });

    if (choice === 0) {
      App.mainWindow.destroy();
    }

    App.mainWindow = null;
  }

  private static onRedirect(event, url: string) {
    if (url !== App.mainWindow.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static async onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.

    Utility.isPackaged()
      ? await HelpFilesManager.initialize(
          join(process.resourcesPath, 'minsky-docs')
        )
      : await HelpFilesManager.initialize(__dirname + '/../../../minsky-docs/');

    App.initMainWindow();

    await App.initMinskyService();

    App.initMenu();

    App.loadMainWindow();
  }

  private static async initMinskyService() {
    const windowId = WindowManager.activeWindows.get(1).systemWindowId;
    console.log('🚀🚀🚀🚀🚀' + green(` WindowId -> ${windowId}`));

    await RestServiceManager.startMinskyService();
  }

  private static initMenu() {
    MenuManager.createMenu();

    RecentFilesManager.initRecentFiles();

    StoreManager.store.onDidChange('recentFiles', () => {
      RecentFilesManager.initRecentFiles();
    });

    (async () => {
      await MenuManager.buildMenuForInsertOperations();
    })();
  }

  private static onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onReady();
    }
  }

  private static initMainWindow() {
    const display = screen.getPrimaryDisplay();
    const workAreaSize = display.workAreaSize;
    const width = Math.round(workAreaSize.width * 0.9);
    const height = Math.round(workAreaSize.height * 0.9);

    // Create the browser window.
    App.mainWindow = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      webPreferences: {
        /*
          The below settings are recommended by nx-electron as shown here https://github.com/bennymeg/nx-electron/blob/master/docs/migration/migrating.v10.md
          But, after using the below settings the app does not start

          contextIsolation: true,
          preload: join(__dirname, 'preload.js'),
        */
        enableRemoteModule: true,
        nodeIntegration: true,
        backgroundThrottling: false,
        affinity: 'window',
      },
      x: 0,
      y: 0,
      title: 'Minsky',
      icon: __dirname + '/assets/favicon.png',
      resizable: true,
      // autoHideMenuBar: true,
      // useContentSize: true,
      // frame: false,
    });

    App.mainWindow.center();

    if (Utility.isDevelopmentMode()) {
      App.mainWindow.webContents.openDevTools({
        mode: 'detach',
        activate: false,
      });
    }

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once('ready-to-show', () => {
      App.mainWindow.show();
    });

    // handle all external redirects in a new browser window
    // App.mainWindow.webContents.on('will-navigate', App.onRedirect);
    // App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    //     App.onRedirect(event, url);
    // });

    // Emitted when the window is closed.

    const mainWindowDetails: ActiveWindow = {
      id: App.mainWindow.id,
      size: App.mainWindow.getSize(),
      isMainWindow: true,
      context: App.mainWindow,
      systemWindowId: WindowManager.getSystemWindowId(this.mainWindow),
    };

    WindowManager.activeWindows.set(App.mainWindow.id, mainWindowDetails);

    logWindows(WindowManager.activeWindows);

    // ContextMenuManager.buildContextMenu();
    App.mainWindow.on('close', () => {
      WindowManager.activeWindows.delete(App.mainWindow.id);
    });

    // TODO: test it on Russell's machine
    // TODO: do the same thing for child windows (godley,plot)
    App.mainWindow.on('focus', async () => {
      console.log(green('On Focus'));
      await CommandsManager.requestRedraw();
    });

    // App.mainWindow.on('blur', async () => {
    //   await CommandsManager.requestRedraw();
    // });

    App.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null;
    });
  }

  private static loadMainWindow() {
    // load the index.html of the app.
    if (!App.application.isPackaged) {
      App.mainWindow.loadURL(rendererAppURL);
    } else {
      App.mainWindow.loadURL(
        format({
          pathname: join(__dirname, '..', rendererAppName, 'index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for
    App.BrowserWindow = browserWindow;
    App.application = app;

    App.application.commandLine.appendSwitch('disable-gpu');
    // Rendering was not working on some window's machines without disabling gpu

    // App.application.commandLine.appendSwitch('high-dpi-support', '1');
    // This probably supports high-res fonts, but we don't know exactly what implications it has!

    //This effects how display scaling is handled -  if set to 1, then it will ignore the scale factor (always set it to 1).
    // Typically, effects are visible on display resolutions > 2MP. Electron seems to scale down its window
    // when native display resolution is > 2MP by default. If we force to 1, it will not scale down
    // App.application.commandLine.appendSwitch('force-device-scale-factor', '1');

    App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on('ready', App.onReady); // App is ready to load data
    App.application.on('activate', App.onActivate); // App is activated

    process.on('uncaughtException', (err) => {
      log.error(
        red(
          `🚀 ~ file: app.ts ~ line 265 ~ App ~ process.on('uncaughtException') ~ err: ${err}`
        )
      );

      if (err?.message) dialog.showErrorBox(err.message, '');
    });
  }
}
