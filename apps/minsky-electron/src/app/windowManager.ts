import { ActiveWindow, AppLayoutPayload, rendererAppURL } from '@minsky/shared';
import * as debug from 'debug';
import { BrowserWindow } from 'electron';
import * as os from 'os';
import { StoreManager } from './storeManager';

const logWindows = debug('minsky:electron_windows');

export class WindowManager {
  static topOffset: number;
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

  static createMenuPopUpWithRouting({
    width = 500,
    height = 500,
    title,
    backgroundColor = StoreManager.store.get('backgroundColor'),
    url = rendererAppURL,
    modal = true,
  }) {
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
    });
    menuWindow.setMenu(null);

    menuWindow.loadURL(url);

    menuWindow.once('ready-to-show', () => {
      menuWindow.show();
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
  }

  static checkBackgroundAndApplyTextColor(color) {
    // Variables for red, green, blue values

    let colorArray;
    let r, g, b;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If RGB --> store the red, green, blue values in separate variables
      colorArray = color.match(
        /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
      );

      r = color[1];
      g = color[2];
      b = color[3];
    } else {
      // If hex --> Convert it to RGB: http://gist.github.com/983661
      colorArray = +(
        '0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&')
      );

      r = colorArray >> 16;
      g = (colorArray >> 8) & 255;
      b = colorArray & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

    const applyCssToBackground = (css) => {
      this.activeWindows.forEach((window) => {
        window.context.webContents.insertCSS(css);
      });
    };

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {
      const css = 'body { background-color: ' + color + '; color: black; }';
      applyCssToBackground(css);
    } else {
      const css = 'body { background-color: ' + color + '; color: white; }';
      applyCssToBackground(css);
    }
  }

  static onAppLayoutChanged({ type, value }: AppLayoutPayload) {
    switch (type) {
      case 'RESIZE':
        WindowManager.mainWindowHeight = value.height;
        WindowManager.mainWindowWidth = value.width;
        break;

      case 'OFFSET':
        // top + menubar height
        WindowManager.topOffset =
          value.top +
          (this.getMainWindow().getSize()[1] -
            this.getMainWindow().getContentSize()[1]);

        WindowManager.leftOffset = value.left;
        break;

      case 'CANVAS':
        
        WindowManager.canvasHeight = value.height;
        WindowManager.canvasWidth = value.width;
        break;

      default:
        break;
    }
  }
}
