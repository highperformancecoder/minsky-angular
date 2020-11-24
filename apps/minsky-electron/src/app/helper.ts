import { BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import * as storage from 'electron-json-storage';
import App from './app';
const window = App.mainWindow;

let storageBackgroundColor;
export function setStorageBackgroundColor(color) {
  storageBackgroundColor = color;
}

export function getStorageBackgroundColor() {
  return storageBackgroundColor;
}

export function addUpdateBookmarkList(mainMenu: Menu) {
  storage.get('bookmarks', (error, data: [{ title: string; click: any }]) => {
    if (error) new Error('File not found or error selecting the file');
    if (data) {
      const outerSubMenu = mainMenu.getMenuItemById('main-bookmark').submenu;
      const innerSubMenu = outerSubMenu.getMenuItemById('delete-bookmark')
        .submenu;

      outerSubMenu.append(new MenuItem({ type: 'separator' }));
      if (Array.isArray(data)) {
        data.forEach((ele) => {
          outerSubMenu.append(
            new MenuItem({
              label: ele.title,
              click: goToSelectedBookmark.bind(ele),
            })
          );
          innerSubMenu.append(
            new MenuItem({
              label: ele.title,
              click: deleteBookmark.bind(ele),
            })
          );
        });
      }
      Menu.setApplicationMenu(mainMenu);
    }
  });
}

export function goToSelectedBookmark() {
  window.loadURL(this.url).catch((err) => {
    throw new Error('Bookmarked url not found');
  });
}

export function deleteBookmark() {
  storage.get('bookmarks', (error, data: [{ title: string; click: any }]) => {
    // tslint:disable-next-line: no-unused-expression
    if (error) new Error('File not found');
    if (data) {
      const ind = data.findIndex((ele) => ele.title === this.title);
      // tslint:disable-next-line: no-unused-expression
      ind > -1 ? data.splice(ind, 1) : new Error('Bookmark Not Found');
      // tslint:disable-next-line: no-shadowed-variable
      storage.set('bookmarks', data, (error) => {
        console.log(error);
      });
      window.webContents.send('refresh-menu');

      // ToDo add code to delete bookmark

      /* const innerSubmenu = template
				.getMenuItemById('main-bookmark')
				.submenu.getMenuItemById('delete-bookmark').submenu.items
			const outerSubmenu = template.getMenuItemById('main-bookmark')
				.submenu.items
			const innerIdx = innerSubmenu.findIndex(
				(ele) => ele.label === this.title
			)
			const outerIdx = outerSubmenu.findIndex(
				(ele) => ele.label === this.title
			)
			innerSubmenu[innerIdx].visible = false
			outerSubmenu[outerIdx].visible = false */

      // innerIdx > -1 ? innerSubmenu.splice(innerIdx, 1) : new Error("Bookmark Not Found");
    }
  });
}

export function checkBackgroundAndApplyTextColor(color) {
  // Variables for red, green, blue values

  let colorArray;
  // tslint:disable-next-line: one-variable-per-declaration
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

    // tslint:disable-next-line: no-bitwise
    r = colorArray >> 16;
    // tslint:disable-next-line: no-bitwise
    g = (colorArray >> 8) & 255;
    // tslint:disable-next-line: no-bitwise
    b = colorArray & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    const css = 'body { background-color: ' + color + '; color: black; }';
    applyCssToBackground(css);
  } else {
    const css = 'body { background-color: ' + color + '; color: white; }';
    applyCssToBackground(css);
  }
}
function applyCssToBackground(css) {
  window.webContents.insertCSS(css);
}

// this function open new popup window
export function createMenuPopUp(
  width,
  height,
  title,
  dirPath,
  menuBackgroundColor
) {
  menuBackgroundColor = menuBackgroundColor || getStorageBackgroundColor();
  let menuWindow = new BrowserWindow({
    width,
    height,
    title,
    resizable: false,
    minimizable: false,
    show: false,
    parent: window,
    modal: true,
    backgroundColor: menuBackgroundColor,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  menuWindow.setMenu(null);
  menuWindow.loadURL(`file://${dirPath}`);
  menuWindow.once('ready-to-show', () => {
    menuWindow.show();
  });
  // menuWindow.webContents.openDevTools(); // command to inspect popup
  menuWindow.on('closed', () => {
    menuWindow = null;
  });
  // Closing global popup event_______
  ipcMain.on('global-menu-popup:cancel', (event) => {
    if (menuWindow) {
      menuWindow.close();
    }
  });
}
export function createMenuPopUpWithRouting({
  width = 500,
  height = 500,
  title,
  backgroundColor = '#ffffff',
  url = 'http://localhost:4200',
}) {
  let menuWindow = new BrowserWindow({
    width,
    height,
    title,
    resizable: false,
    minimizable: false,
    show: false,
    parent: window,
    modal: true,
    backgroundColor,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  menuWindow.setMenu(null);

  menuWindow.loadURL(url);

  menuWindow.once('ready-to-show', () => {
    menuWindow.show();
  });
  menuWindow.webContents.openDevTools({ mode: 'detach' }); // command to inspect popup
  menuWindow.on('closed', () => {
    menuWindow = null;
  });
  // Closing global popup event_______
  ipcMain.on('global-menu-popup:cancel', () => {
    if (menuWindow) {
      menuWindow.close();
    }
  });
}
