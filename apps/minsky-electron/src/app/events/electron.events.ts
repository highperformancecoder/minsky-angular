/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import {
  AppLayoutPayload,
  commandsMapping,
  MinskyProcessPayload,
  newLineCharacter,
} from '@minsky/shared';
import { spawn } from 'child_process';
import * as debug from 'debug';
import { app, ipcMain, Menu, MenuItem } from 'electron';
import * as storage from 'electron-json-storage';
import * as log from 'electron-log';
import { environment } from '../../environments/environment';
import App from '../app';
import {
  addUpdateBookmarkList,
  checkBackgroundAndApplyTextColor,
  createMenu,
  // createMenuPopUp,
  createMenuPopUpWithRouting,
  deleteBookmark,
  goToSelectedBookmark,
  handleMinskyProcess,
  setStorageBackgroundColor,
} from './../helper';

const logError = debug('minsky:electron_error');
const logUpdateEvent = debug('minsky:electron_update_event');

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

ipcMain.on('minsky-process', (event, payload: MinskyProcessPayload) => {
  handleMinskyProcess(event, payload);
});

ipcMain.on('get-minsky-commands', (event) => {
  let listOfCommands = [];

  const getMinskyCommandsProcess = spawn(App.minskyRESTServicePath);
  getMinskyCommandsProcess.stdin.write(commandsMapping.LIST + newLineCharacter);

  setTimeout(() => {
    getMinskyCommandsProcess.stdout.emit('close');
  }, 1000);

  getMinskyCommandsProcess.stdout
    .on('data', (data) => {
      listOfCommands = [
        ...listOfCommands,
        ...data.toString().trim().split(newLineCharacter),
      ];
    })
    .on('error', (error) => {
      log.error(`error: ${error.message}`);
    })
    .on('close', (code) => {
      log.info(`"get-minsky-commands" child process exited with code ${code}`);
      event.returnValue = listOfCommands;
    });
});

ipcMain.on('app-layout-changed', (event, { type, value }: AppLayoutPayload) => {
  switch (type) {
    case 'RESIZE':
      App.mainWindowHeight = value.height;
      App.mainWindowHeight = value.width;
      break;

    case 'OFFSET':
      App.topOffset = value.top;
      App.leftOffset = value.left;
      break;

    default:
      break;
  }
});

ipcMain.on('load-menu', () => {
  createMenu();
});
