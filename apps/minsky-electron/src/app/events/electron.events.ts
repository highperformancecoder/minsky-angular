/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { AppLayoutPayload, events, MinskyProcessPayload } from '@minsky/shared';
import * as debug from 'debug';
import { ipcMain } from 'electron';
import * as keysym from 'keysym';
import * as utf8 from 'utf8';
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
    KEY_PRESS,
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
  RestServiceManager.handleMinskyProcess(payload);
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

ipcMain.on(KEY_PRESS, (event, payload) => {
  console.log('🚀 ~ file: electron.events.ts ~ line 88 ~ payload', payload);
  const { key, shift, capsLock, ctrl, alt, mouseX, mouseY } = payload;

  console.log(
    '🚀 ~ file: electron.events.ts ~ line 83 ~ ipcMain.on ~ key',
    key,
    keysym.fromName(key).keysym,
    utf8.encode(key)
  );

  // TODO:
  // RestServiceManager.handleMinskyProcess({command:`${commandsMapping.KEY_PRESS} [${}]`})

  /*
    stdout: /minsky/canvas/keyPress/@signature=>{"args":["int","const std::string&","int","float","float"],"ret":"bool"}
    args:[keySym,utf8,"1-shift 2-capslock,3-ctrl,4-alt",mouseX,mouseY]

    if pressed all keys at once (shift+capslock+ctrl+alt) the 3rd arg will be 1248
    */
});
