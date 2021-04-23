import { startServer } from '@minsky/minsky-server';
import { ActiveWindow, rendererAppName, rendererAppURL } from '@minsky/shared';
import * as debug from 'debug';
import { BrowserWindow, dialog, screen, shell } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { environment } from '../environments/environment';
import { ContextMenuManager } from './contextMenuManager';
import { MenuManager } from './menuManager';
import { RecentFilesManager } from './recentFilesManager';
import { RestServiceManager } from './restServiceManager';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';

const logWindows = debug('minsky:electron_windows');

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnvironment: boolean =
      parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

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

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.

    (async () => {
      await startServer(/* { serverPortRangeEnd, serverPortRangeStart } */);
    })();

    App.initMainWindow();
    App.loadMainWindow();

    App.initMenu();

    App.initMinskyService();
  }

  private static initMinskyService() {
    const minskyRestServiceFilePath = StoreManager.store.get(
      'minskyRESTServicePath'
    );

    try {
      if (minskyRestServiceFilePath) {
        setTimeout(() => {
          RestServiceManager.startMinskyService(minskyRestServiceFilePath);
        }, 3000);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  private static initMenu() {
    MenuManager.createMenu();

    RecentFilesManager.initRecentFiles();

    StoreManager.store.onDidChange('recentFiles', () => {
      RecentFilesManager.initRecentFiles();
    });
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
    const width = Math.min(workAreaSize.width - 100, 1366);
    const height = Math.min(workAreaSize.height - 100, 768);

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
        allowRunningInsecureContent: this.isDevelopmentMode ? true : false,
      },
      x: 0,
      y: 0,
      title: 'Minsky',
      icon: __dirname + '/assets/favicon.png',
      resizable: false,
    });
    App.mainWindow.setMenu(null);
    App.mainWindow.center();

    if (this.isDevelopmentMode()) {
      App.mainWindow.webContents.openDevTools({
        mode: 'detach',
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
      windowId: WindowManager.getWindowId(this.mainWindow),
    };

    WindowManager.activeWindows.set(App.mainWindow.id, mainWindowDetails);

    logWindows(WindowManager.activeWindows);

    ContextMenuManager.buildContextMenu();
    App.mainWindow.on('close', () => {
      WindowManager.activeWindows.delete(App.mainWindow.id);
    });

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

    App.application.commandLine.appendSwitch('high-dpi-support', '1');
    App.application.commandLine.appendSwitch('force-device-scale-factor', '1');
    App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on('ready', App.onReady); // App is ready to load data
    App.application.on('activate', App.onActivate); // App is activated
  }
}
