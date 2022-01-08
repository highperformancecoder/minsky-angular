import {
  ActiveWindow,
  AppLayoutPayload,
  CreateWindowPayload,
  green,
  isMacOS,
  OPEN_DEV_TOOLS_IN_DEV_BUILD,
  rendererAppName,
  rendererAppURL,
} from '@minsky/shared';
import * as debug from 'debug';
import { BrowserWindow, dialog, Menu, screen } from 'electron';
import * as log from 'electron-log';
import * as os from 'os';
import { join } from 'path';
import { format } from 'url';
import { Utility } from '../utility';

const logWindows = debug('minsky:electron_windows');

export class WindowManager {
  static topOffset: number;
  static electronTopOffset: number;
  static leftOffset: number;
  static canvasHeight: number;
  static canvasWidth: number;
  static scaleFactor: number;

  static activeWindows = new Map<number, ActiveWindow>();
  private static uidToWindowMap = new Map<number, ActiveWindow>();

  static getWindowByUid(uid: number): ActiveWindow {
    return this.uidToWindowMap.get(uid);
  }

  static storeWindowMenu(win: BrowserWindow, menu: Menu) {
    const details = this.activeWindows.get(win.id);
    if (details) {
      details.menu = menu;
    }
    if (isMacOS()) {
      win.on('focus', function () {
        Menu.setApplicationMenu(menu);
      });
    }
  }

  static setApplicationMenu(win: BrowserWindow) {
    if (isMacOS()) {
      const details = this.activeWindows.get(win.id);
      if (details) {
        Menu.setApplicationMenu(details.menu);
      }
    }
  }

  static getSystemWindowId(menuWindow: BrowserWindow) {
    const nativeBuffer = menuWindow.getNativeWindowHandle();
    switch (nativeBuffer.length) {
      case 4:
        return BigInt(
          os.endianness() == 'LE'
            ? nativeBuffer.readUInt32LE(0)
            : nativeBuffer.readUInt32BE(0)
        );
      case 8:
        return os.endianness() == 'LE'
          ? nativeBuffer.readBigUInt64LE(0)
          : nativeBuffer.readBigUInt64BE(0);
      default:
        log.error('Unsupported native window handle type');
        return BigInt(0);
    }
  }

  static getMainWindow(): BrowserWindow {
    return this.activeWindows.get(1).context; // TODO:: Is this accurate?
  }

  static focusIfWindowIsPresent(uid: number) {
    const windowDetails = this.uidToWindowMap.get(uid);
    if (windowDetails) {
      windowDetails.context.focus();
      return true;
    }
    return false;
  }

  static getWindowUrl(url: string) {
    if (!Utility.isPackaged()) {
      const initialURL = url ? rendererAppURL + url : rendererAppURL;
      return initialURL;
    }

    const path = format({
      pathname: join(__dirname, '..', rendererAppName, 'index.html'),
      protocol: 'file:',
      slashes: true,
    });

    const initialURL = path + (url || '#/');
    return initialURL;
  }

  static createPopupWindowWithRouting(
    payload: CreateWindowPayload,
    // eslint-disable-next-line @typescript-eslint/ban-types
    onCloseCallback?: (ev : Electron.Event) => void
  ): BrowserWindow {
    const window = WindowManager.createWindow(payload, onCloseCallback);
    const url = this.getWindowUrl(payload.url);
    window.loadURL(url);
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

  private static createWindow(
    payload: CreateWindowPayload,
    onCloseCallback?: (ev : Electron.Event) => void
  ) {
    const { width, height, title, modal = true, backgroundColor } = payload;
    const childWindow = new BrowserWindow({
      width,
      height,
      title,
      resizable: true,
      minimizable: false,
      show: false,
      parent: null /* modal ? mainWindow : null */, // Having a parent hides control on MacOS
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

    /* Dev tools results in lag in handling multiple key inputs. Hence enable only temporarily when needed */
    if (Utility.isDevelopmentMode() && OPEN_DEV_TOOLS_IN_DEV_BUILD) {
      childWindow.webContents.openDevTools({ mode: 'detach', activate: false });
      // command to inspect popup
    }

    const windowId = WindowManager.getSystemWindowId(childWindow);
    const childWindowDetails: ActiveWindow = {
      id: childWindow.id,
      size: childWindow.getSize(),
      isMainWindow: false,
      context: childWindow,
      systemWindowId: windowId,
      menu: null,
    };

    if (payload.uid) {
      this.uidToWindowMap.set(payload.uid, childWindowDetails);
    }

    this.activeWindows.set(childWindow.id, childWindowDetails);
    logWindows(WindowManager.activeWindows);

    childWindow.on('close', (ev : Electron.Event) => {
      try {
        if (payload?.uid) {
          this.uidToWindowMap.delete(payload.uid);
        }
        if (childWindow?.id) {
          this.activeWindows.delete(childWindow.id);
        }
        if (onCloseCallback) {
          onCloseCallback(ev);
        }
      } catch (error) {
        console.error(error);
      }
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

  static onAppLayoutChanged(payload: AppLayoutPayload) {
    console.log(green('Setting the offset and height width of canvas'));

    this.topOffset = Math.round(payload.offset.top);
    this.leftOffset = Math.round(payload.offset.left);
    this.scaleFactor = screen.getPrimaryDisplay().scaleFactor;

    console.log(
      '🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀SF = ',
      this.scaleFactor,
      ' Menu bar height = ',
      payload.offset.electronMenuBarHeight,
      ' Offset Top=',
      payload.offset.top
    );

    this.electronTopOffset = Math.round(
      payload.offset.electronMenuBarHeight + payload.offset.top
    );

    this.canvasHeight = payload.drawableArea.height;
    this.canvasWidth = payload.drawableArea.width;
  }

  static showMouseCoordinateWindow({ mouseX, mouseY }) {
    dialog.showMessageBox(WindowManager.getMainWindow(), {
      message: `MouseX: ${mouseX}, MouseY: ${mouseY}`,
      title: 'Mouse Coordinates',
      type: 'info',
    });
  }
}
