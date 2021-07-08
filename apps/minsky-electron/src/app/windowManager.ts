import {
  ActiveWindow,
  AppLayoutPayload,
  CreateWindowPayload,
  getBackgroundStyle,
  green,
  rendererAppName,
  rendererAppURL,
} from '@minsky/shared';
import * as debug from 'debug';
import { BrowserWindow, dialog, screen } from 'electron';
import * as os from 'os';
import { join } from 'path';
import { format } from 'url';
import { Utility } from './utility';

const logWindows = debug('minsky:electron_windows');

export class WindowManager {
  static topOffset: number;
  static electronTopOffset: number;
  static leftOffset: number;
  static canvasHeight: number;
  static canvasWidth: number;

  static mainWindowHeight: number;
  static mainWindowWidth: number;

  static activeWindows = new Map<number, ActiveWindow>();

  static getWindowId(menuWindow: BrowserWindow) {
    const offset = 0;
    const windowId =
      os.endianness() == 'LE'
        ? menuWindow.getNativeWindowHandle().readInt32LE(offset)
        : menuWindow.getNativeWindowHandle().readInt32BE(offset);

    return windowId;
  }

  static getMainWindow(): BrowserWindow {
    return this.activeWindows.get(1).context;
  }

  static createMenuPopUpWithRouting(
    payload: CreateWindowPayload
  ): BrowserWindow {
    console.log(
      '🚀 ~ file: windowManager.ts ~ line 78 ~ WindowManager ~ __dirname',
      __dirname
    );
    const window = WindowManager.createWindow(payload);

    if (!Utility.isPackaged()) {
      const initialURL = payload.url
        ? rendererAppURL + payload.url
        : rendererAppURL;

      window.loadURL(initialURL);
      return window;
    }

    const path = format({
      pathname: join(__dirname, '..', rendererAppName, 'index.html'),
      protocol: 'file:',
      slashes: true,
    });

    const initialURL = path + (payload.url || '#/');

    window.loadURL(initialURL);
    return window;
  }

  static createMenuPopUpAndLoadFile(
    payload: CreateWindowPayload
  ): BrowserWindow {
    const window = WindowManager.createWindow(payload);

    const filePath = format({
      pathname: payload.url,
      protocol: 'file:',
      slashes: true,
    });
    console.log(
      '🚀 ~ file: windowManager.ts ~ line 85 ~ WindowManager ~ filePath',
      filePath
    );

    window.loadURL(filePath);
    return window;
  }

  private static createWindow(payload: CreateWindowPayload) {
    const { width, height, title, modal, backgroundColor } = payload;

    const window = WindowManager.getMainWindow();

    let menuWindow = new BrowserWindow({
      width,
      height,
      title,
      resizable: false,
      minimizable: false,
      show: false,
      parent: window,
      modal,
      backgroundColor,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
      icon: __dirname + '/assets/favicon.png',
    });
    menuWindow.setMenu(null);

    menuWindow.once('ready-to-show', () => {
      menuWindow.show();
    });

    menuWindow.once('page-title-updated', (event) => {
      event.preventDefault();
    });

    menuWindow.webContents.openDevTools({ mode: 'detach' }); // command to inspect popup

    const windowId = WindowManager.getWindowId(menuWindow);

    const menuWindowDetails: ActiveWindow = {
      id: menuWindow.id,
      size: menuWindow.getSize(),
      isMainWindow: false,
      context: menuWindow,
      windowId,
    };

    WindowManager.activeWindows.set(menuWindow.id, menuWindowDetails);

    logWindows(WindowManager.activeWindows);

    menuWindow.on('close', () => {
      WindowManager.activeWindows.delete(menuWindow.id);
    });

    menuWindow.on('closed', () => {
      menuWindow = null;
    });

    return menuWindow;
  }

  public static scrollToCenter() {
    // TODO:: Replace this with something cleaner
    this.getMainWindow().webContents.executeJavaScript(
      `var container=document.getElementsByClassName('minsky-canvas-container')[0]; var canvas = container.getElementsByTagName('canvas')[0]; container.scrollTop=canvas.clientHeight/2; container.scrollLeft=canvas.clientWidth/2;`,
      false
    );
  }

  public static changeWindowBackgroundColor = (color: string) => {
    const style = getBackgroundStyle(color);

    WindowManager.activeWindows.forEach((window) => {
      window.context.webContents.insertCSS(style);
    });
  };

  static onAppLayoutChanged({ type, value }: AppLayoutPayload) {
    console.log(green('Initializing the offset and height width of canvas'));
    console.table({ type, value });
    switch (type) {
      case 'RESIZE':
        if (!WindowManager.mainWindowHeight) {
          WindowManager.mainWindowHeight = value.height;
        }

        if (!WindowManager.mainWindowWidth) {
          WindowManager.mainWindowWidth = value.width;
        }
        break;

      case 'OFFSET':
        if (!WindowManager.topOffset) {
          WindowManager.topOffset = Math.round(value.top);
        }

        if (!WindowManager.electronTopOffset) {
          const scaleFactor = screen.getPrimaryDisplay().scaleFactor;

          WindowManager.electronTopOffset = Math.round(
            value.electronMenuBarHeight * scaleFactor + value.top
          );
        }

        if (!WindowManager.leftOffset) {
          WindowManager.leftOffset = Math.round(value.left);
        }
        break;

      case 'CANVAS':
        if (!WindowManager.canvasHeight) {
          WindowManager.canvasHeight = value.height;
        }

        if (!WindowManager.canvasWidth) {
          WindowManager.canvasWidth = value.width;
        }
        break;

      default:
        break;
    }
  }

  static showMouseCoordinateWindow({ mouseX, mouseY }) {
    dialog.showMessageBox(WindowManager.getMainWindow(), {
      message: `MouseX: ${mouseX}, MouseY: ${mouseY}`,
      title: 'Mouse Coordinates',
      type: 'info',
    });
  }
}
