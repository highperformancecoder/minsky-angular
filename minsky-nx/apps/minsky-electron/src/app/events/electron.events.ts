/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain, Menu, MenuItem } from 'electron';
import * as storage from 'electron-json-storage';
import { environment } from '../../environments/environment';
import App from '../app';
import {
  addUpdateBookmarkList,
  checkBackgroundAndApplyTextColor,
  createMenuPopUp,
  deleteBookmark,
  goToSelectedBookmark,
  setStorageBackgroundColor,
} from './../helper';
export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
  console.log(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});

ipcMain.on('save-bookmark', (event, data) => {
  if (data) {
    const menu = Menu.getApplicationMenu();
    storage.get(data.fileName, (error, fileData: any) => {
      if (error) throw error;
      const dataToSave = {
        title: data.bookmarkTitle,
        url: App.mainWindow.webContents.getURL(),
      };

      fileData.push(dataToSave);
      // tslint:disable-next-line: no-shadowed-variable
      storage.set(data.fileName, fileData, (error) => {
        if (error) throw error;
      });
      const outerSubMenu = menu.getMenuItemById('main-bookmark').submenu;
      const innerSubMenu = outerSubMenu.getMenuItemById('delete-bookmark')
        .submenu;
      outerSubMenu.append(
        new MenuItem({
          label: data.bookmarkTitle,
          click: goToSelectedBookmark.bind(dataToSave),
        })
      );
      innerSubMenu.append(
        new MenuItem({
          label: data.bookmarkTitle,
          click: deleteBookmark.bind(dataToSave),
        })
      );
      Menu.setApplicationMenu(menu);
    });
  }
  event.reply('bookmark-done-reply');
});

ipcMain.on('background-color:ok', (event, data) => {
  storage.set('backgroundColor', { color: data.color }, (error) => {
    if (error) console.error(error);
  });

  checkBackgroundAndApplyTextColor(data.color);
  setStorageBackgroundColor(data.color);
  event.reply('background-color:ok-reply');
});

ipcMain.on('create-new-window', (event, data) => {
  console.log(data);
  const { width, height, title, dirPath, bgColor } = data;
  createMenuPopUp(width, height, title, dirPath, bgColor);
});

ipcMain.on('ready-template', (event) => {
  addUpdateBookmarkList(Menu.getApplicationMenu());
});
