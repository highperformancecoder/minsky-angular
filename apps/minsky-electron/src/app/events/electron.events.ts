/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import {
  AppLayoutPayload,
  commandsMapping,
  events,
  MinskyProcessPayload,
} from '@minsky/shared';
import * as debug from 'debug';
import { ipcMain } from 'electron';
import { environment } from '../../environments/environment';
import { BookmarkManager } from '../bookmarkManager';
import { CommandsManager } from '../commandsManager';
import { ContextMenuManager } from '../contextMenuManager';
import { KeyBindingManager } from '../keyBindingManager';
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
  ADD_RECENT_FILE,
  APP_LAYOUT_CHANGED,
  CREATE_MENU_POPUP,
  MINSKY_PROCESS,
  POPULATE_BOOKMARKS,
  SET_BACKGROUND_COLOR,
  GET_APP_VERSION,
  KEY_PRESS,
  TOGGLE_MINSKY_SERVICE,
  MINSKY_PROCESS_FOR_IPC_MAIN,
  NEW_SYSTEM,
  AUTO_START_MINSKY_SERVICE,
  GET_PREFERENCES,
  UPDATE_PREFERENCES,
  CONTEXT_MENU,
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

// MINSKY_PROCESS_FOR_IPC_MAIN won't reply with the response
ipcMain.on(
  MINSKY_PROCESS_FOR_IPC_MAIN,
  async (event, payload: MinskyProcessPayload) => {
    await RestServiceManager.handleMinskyProcess(payload);
  }
);

ipcMain.handle(MINSKY_PROCESS, async (event, payload: MinskyProcessPayload) => {
  return await RestServiceManager.handleMinskyProcess(payload);
});

ipcMain.on(APP_LAYOUT_CHANGED, (event, payload: AppLayoutPayload) => {
  WindowManager.onAppLayoutChanged(payload);
});

ipcMain.on(POPULATE_BOOKMARKS, async (event, bookmarks: string[]) => {
  await BookmarkManager.populateBookmarks(bookmarks);
});

ipcMain.on(ADD_RECENT_FILE, (event, filePath: string) => {
  RecentFilesManager.addFileToRecentFiles(filePath);
});

ipcMain.handle(KEY_PRESS, async (event, payload: MinskyProcessPayload) => {
  return await KeyBindingManager.handleOnKeyPress(payload);
});

ipcMain.handle(GET_PREFERENCES, () => {
  return StoreManager.store.get('preferences');
});

ipcMain.handle(
  UPDATE_PREFERENCES,
  async (event, preferencesPayload: Record<string, unknown>) => {
    const { font, ...preferences } = preferencesPayload;
    const {
      enableMultipleEquityColumns,
      godleyTableShowValues,
      godleyTableOutputStyle,
    } = preferences;

    StoreManager.store.set('preferences', preferences);

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.SET_GODLEY_DISPLAY_VALUE} [${godleyTableShowValues},"${godleyTableOutputStyle}"}]`,
    });

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.MULTIPLE_EQUITIES} ${enableMultipleEquityColumns}`,
    });

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.DEFAULT_FONT} ${font}`,
    });

    RecentFilesManager.updateNumberOfRecentFilesToDisplay();
    return;
  }
);

ipcMain.on(TOGGLE_MINSKY_SERVICE, async () => {
  await RestServiceManager.toggleMinskyService();
});

ipcMain.on(AUTO_START_MINSKY_SERVICE, async () => {
  await RestServiceManager.startMinskyService();
});

ipcMain.handle(NEW_SYSTEM, async () => {
  await CommandsManager.createNewSystem();
  return;
});

ipcMain.on(CONTEXT_MENU, async (event, { x, y }) => {
  await ContextMenuManager.initContextMenu(x, y);
});
