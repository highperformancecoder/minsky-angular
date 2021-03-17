/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { AppLayoutPayload, MinskyProcessPayload } from '@minsky/shared';
import * as debug from 'debug';
import { app, ipcMain } from 'electron';
import { environment } from '../../environments/environment';
import { BookmarkManager } from '../bookmarkManager';
import { RecentFilesManager } from '../recentFilesManager';
import { RestServiceManager } from '../restServiceManager';
import { StoreManager } from '../storeManager';
import { WindowManager } from '../windowManager';

const logUpdateEvent = debug('minsky:electron_update_event');

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

// Retrieve app version
ipcMain.handle('get-app-version', () => {
  logUpdateEvent(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});

ipcMain.on('set-background-color', (event, { color }) => {
  if (color) {
    StoreManager.store.set('backgroundColor', color);
  }
  WindowManager.checkBackgroundAndApplyTextColor(
    StoreManager.store.get('backgroundColor')
  );
});

ipcMain.on('create-menu-popup', (event, data) => {
  WindowManager.createMenuPopUpWithRouting(data);
});

ipcMain.on('minsky-process', (event, payload: MinskyProcessPayload) => {
  RestServiceManager.handleMinskyProcess(event, payload);
});

ipcMain.on('get-minsky-commands', (event) => {
  RestServiceManager.onGetMinskyCommands(event);
});

ipcMain.on('app-layout-changed', (event, payload: AppLayoutPayload) => {
  WindowManager.onAppLayoutChanged(payload);
});

ipcMain.on('populate-bookmarks', (event, bookmarkString: string) => {
  BookmarkManager.populateBookmarks(bookmarkString);
});

ipcMain.on('populate-bookmarks', (event, bookmarkString: string) => {
  BookmarkManager.populateBookmarks(bookmarkString);
});

ipcMain.on('add-recent-file', (event, filePath: string) => {
  RecentFilesManager.addFileToRecentFiles(filePath);
});
