/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { AppLayoutPayload, events, MinskyProcessPayload } from '@minsky/shared';
import * as debug from 'debug';
import { ipcMain } from 'electron';
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

const {
  ipc: {
    ADD_RECENT_FILE,
    APP_LAYOUT_CHANGED,
    CREATE_MENU_POPUP,
    GET_MINSKY_COMMANDS,
    MINSKY_PROCESS,
    POPULATE_BOOKMARKS,
    SET_BACKGROUND_COLOR,
    GET_APP_VERSION,
    TOGGLE_MINSKY_SERVICE,
  },
} = events;

// Retrieve app version
ipcMain.handle(GET_APP_VERSION, () => {
  logUpdateEvent(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

ipcMain.on(SET_BACKGROUND_COLOR, (event, { color }) => {
  if (color) {
    StoreManager.store.set('backgroundColor', color);
  }
  WindowManager.checkBackgroundAndApplyTextColor(
    StoreManager.store.get('backgroundColor')
  );
});

ipcMain.on(CREATE_MENU_POPUP, (event, data) => {
  WindowManager.createMenuPopUpWithRouting(data);
});

ipcMain.on(MINSKY_PROCESS, (event, payload: MinskyProcessPayload) => {
  RestServiceManager.handleMinskyProcess(event, payload);
});

ipcMain.on(GET_MINSKY_COMMANDS, (event) => {
  RestServiceManager.onGetMinskyCommands(event);
});

ipcMain.on(APP_LAYOUT_CHANGED, (event, payload: AppLayoutPayload) => {
  WindowManager.onAppLayoutChanged(payload);
});

ipcMain.on(POPULATE_BOOKMARKS, (event, bookmarkString: string) => {
  BookmarkManager.populateBookmarks(bookmarkString);
});

ipcMain.on(ADD_RECENT_FILE, (event, filePath: string) => {
  RecentFilesManager.addFileToRecentFiles(filePath);
});

ipcMain.on(TOGGLE_MINSKY_SERVICE, async (event) => {
  await RestServiceManager.toggleMinskyService(event);
});
