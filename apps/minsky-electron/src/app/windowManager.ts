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

  static activeWindows = new Map<number, ActiveWindow>();
  private static uidToWindowMap = new Map<number, ActiveWindow>();

  static getWindowByUid(uid: number): ActiveWindow {
    return this.uidToWindowMap.get(uid);
  }

  static getSystemWindowId(menuWindow: BrowserWindow) {
    const offset = 0;
    const windowId =
      os.endianness() == 'LE'
        ? menuWindow.getNativeWindowHandle().readBigUInt64LE(offset)
        : menuWindow.getNativeWindowHandle().readBigUInt64BE(offset);

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

  static createMenuPopUpWithRouting(
    payload: CreateWindowPayload
  ): BrowserWindow {
    const window = WindowManager.createWindow(payload);
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

  static onAppLayoutChanged(payload: AppLayoutPayload) {
    console.log(green('Setting the offset and height width of canvas'));
    
    
    this.topOffset = Math.round(payload.offset.top);
    this.leftOffset = Math.round(payload.offset.left);
    const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
    this.electronTopOffset = Math.round(payload.offset.electronMenuBarHeight * scaleFactor + payload.offset.top);

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
