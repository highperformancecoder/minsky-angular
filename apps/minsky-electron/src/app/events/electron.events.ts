/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { ChildProcess, spawn } from 'child_process';
import * as debug from 'debug';
import { app, ipcMain, Menu, MenuItem } from 'electron';
import * as storage from 'electron-json-storage';
import { join } from 'path';
import { environment } from '../../environments/environment';
import App from '../app';
import { activeWindows } from '../constants';
import {
  addUpdateBookmarkList,
  checkBackgroundAndApplyTextColor,
  createMenu,
  // createMenuPopUp,
  createMenuPopUpWithRouting,
  deleteBookmark,
  goToSelectedBookmark,
  setStorageBackgroundColor,
} from './../helper';

const logError = debug('minsky:electron_error');
const logUpdateEvent = debug('minsky:electron_update_event');
const logChildProcessEvent = debug('minsky:electron_child_process');
const logCairo = debug('minsky:electron_cairo');

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
  logUpdateEvent(`Fetching application version... [v${environment.version}]`);

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
    if (error) {
      logError(error);
    }
  });

  checkBackgroundAndApplyTextColor(data.color);
  setStorageBackgroundColor(data.color);
  event.reply('background-color:ok-reply');
});

/* ipcMain.on('create-new-window', (event, data) => {
  const { width, height, title, dirPath, bgColor } = data;
  createMenuPopUp(width, height, title, dirPath, bgColor);
});
 */
ipcMain.on('create-menu-popup', (event, data) => {
  createMenuPopUpWithRouting(data);
});

ipcMain.on('ready-template', () => {
  addUpdateBookmarkList(Menu.getApplicationMenu());
});

let cairo: ChildProcess;

ipcMain.on('cairo', (event, msg) => {
  let txt: string;

  if (typeof event === 'string') {
    txt = event;
  } else {
    txt = JSON.stringify(msg);
  }

  logCairo(txt);

  if (cairo) {
    cairo.stdin.write(txt + '\n');
  } else {
    const { windowId } = activeWindows.get(1);
    console.log('Native window id: ', windowId);
    // return;

    cairo = spawn(
      join(__dirname, '..', '..', '..', '/cairo-subwindow-test/main'),
      [txt, `${windowId}`]
    );

    cairo.stdout.on('data', (data) => {
      logChildProcessEvent(`stdout: ${data}`);
    });

    cairo.stderr.on('data', (data) => {
      logChildProcessEvent(`stderr: ${data}`);
    });

    cairo.on('error', (error) => {
      logChildProcessEvent(`error: ${error.message}`);
    });

    cairo.on('close', (code) => {
      logChildProcessEvent(`child process exited with code ${code}`);
    });
  }
});

ipcMain.on('load-menu', () => {
  createMenu();
});
