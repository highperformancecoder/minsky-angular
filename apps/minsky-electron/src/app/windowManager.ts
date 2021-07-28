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
  private static uidToWindowMap = new Map<number, ActiveWindow>();


  static getWindowByUid(uid : number) : ActiveWindow {
    return this.uidToWindowMap.get(uid);
  }

  static getSystemWindowId(menuWindow: BrowserWindow) {
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

  static focusIfWindowIsPresent(uid: number) {
    const windowDetails = this.uidToWindowMap.get(uid);
    if (windowDetails) {
      windowDetails.context.focus();
      return true;
    }
    return false;
  }

  static createMenuPopUpWithRouting(
    payload: CreateWindowPayload
  ): BrowserWindow {
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

  static closeWindowByUid(uid: number) {
    const windowDetails = this.uidToWindowMap.get(uid);
    if (windowDetails) {
      this.uidToWindowMap.delete(uid);
      windowDetails.context.close();
    }
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

    window.loadURL(filePath);
    return window;
  }

  private static createWindow(payload: CreateWindowPayload) {
    const { width, height, title, modal, backgroundColor } = payload;

    const mainWindow = WindowManager.getMainWindow();

    let childWindow = new BrowserWindow({
      width,
      height,
      title,
      resizable: false,
      minimizable: false,
      show: false,
      parent: mainWindow,
      modal,
      backgroundColor,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
      icon: __dirname + '/assets/favicon.png',
    });

   

    childWindow.setMenu(null);

    childWindow.once('ready-to-show', () => {
      childWindow.show();
    });

    childWindow.once('page-title-updated', (event) => {
      event.preventDefault();
    });

    childWindow.webContents.openDevTools({ mode: 'detach' }); // command to inspect popup

    const windowId = WindowManager.getSystemWindowId(childWindow);

    const childWindowDetails: ActiveWindow = {
      id: childWindow.id,
      size: childWindow.getSize(),
      isMainWindow: false,
      context: childWindow,
      systemWindowId: windowId,
    };

    if (payload.uid) {
      console.log('Adding to map :: ', payload.uid);
      this.uidToWindowMap.set(payload.uid, childWindowDetails);
    }

    this.activeWindows.set(childWindow.id, childWindowDetails);

    logWindows(WindowManager.activeWindows);

    childWindow.on('close', () => {
      if (payload.uid) {
        this.uidToWindowMap.delete(payload.uid);
      }
      this.activeWindows.delete(childWindow.id);
    });

    childWindow.on('closed', () => {
      childWindow = null;
    });

    return childWindow;
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
