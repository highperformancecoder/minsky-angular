import {
  ActiveWindow,
  availableOperations,
  commandsMapping,
  MinskyProcessPayload,
  minskyProcessReplyIndicators,
} from '@minsky/shared';
import { ChildProcess, spawn } from 'child_process';
import * as debug from 'debug';
import {
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  shell,
} from 'electron';
import * as log from 'electron-log';
import { readFileSync, writeFile } from 'fs';
import { join } from 'path';
import App from './app';
import { activeWindows, rendererAppURL } from './constants';
import { getWindowId } from './windowHelper';

const logError = debug('minsky:electron_error');
const logMenuEvent = debug('minsky:electron_menu_logs');
const logWindows = debug('minsky:electron_windows');

function getMainWindow(): BrowserWindow {
  return activeWindows.get(1).context;
}

let storageBackgroundColor;
export function setStorageBackgroundColor(color) {
  storageBackgroundColor = color;
}

export function getStorageBackgroundColor() {
  return storageBackgroundColor;
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
  const window = getMainWindow();
  window.webContents.insertCSS(css);
}

export function createMenuPopUpWithRouting({
  width = 500,
  height = 500,
  title,
  backgroundColor = '#ffffff',
  url = rendererAppURL,
  modal = true,
}) {
  const window = getMainWindow();

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

  const windowId = getWindowId(menuWindow);

  const menuWindowDetails: ActiveWindow = {
    id: menuWindow.id,
    size: menuWindow.getSize(),
    isMainWindow: false,
    context: menuWindow,
    windowId,
  };

  activeWindows.set(menuWindow.id, menuWindowDetails);

  logWindows(activeWindows);

  menuWindow.on('close', () => {
    activeWindows.delete(menuWindow.id);
  });

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

export function createMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'About Minsky',
          click() {
            createMenuPopUpWithRouting({
              width: 420,
              height: 440,
              title: '',
              url: `${rendererAppURL}/#/menu/file/about`,
              backgroundColor: '#ffffff',
            });

            shell.beep();
          },
        },
        {
          label: 'Upgrade',
          click() {
            shell.openExternal('https://www.patreon.com/hpcoder');
          },
        },
        {
          label: 'New System',
          accelerator: 'CmdOrCtrl + N',
          click() {
            logMenuEvent('TODO -> topMenu -> New System');
            // win.hide();
            // createWindow();
          },
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl + O',
          enabled: true,
          async click() {
            try {
              const _dialog = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{ name: '*.mky', extensions: ['mky'] }],
              });

              const loadPayload: MinskyProcessPayload = {
                command: '/minsky/load',
                filePath: _dialog.filePaths[0].toString(),
              };

              handleMinskyProcessAndRender(loadPayload);
            } catch (error) {
              logError(error);
            }
          },
        },
        {
          label: 'Open Recent',
          id: 'openRecent',
          submenu: [
            { type: 'separator' },
            {
              label: 'Clear Recent',
              id: 'clearRecent',
              click: () => {
                App.store.set('recentFiles', []);
                Menu.getApplicationMenu()
                  .getMenuItemById('openRecent')
                  .submenu.items.forEach((i) => {
                    if (i.id !== 'clearRecent') {
                      i.visible = false;
                    }
                  });
              },
            },
          ],
        },
        {
          label: 'Library',
          click() {
            shell.openExternal(
              'https://github.com/highperformancecoder/minsky-models'
            );
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl + S',
          async click() {
            try {
              const content = 'This is the content of new file';

              const result = await dialog.showSaveDialog({
                filters: [{ name: 'text', extensions: ['txt'] }],
              });

              logMenuEvent(result);

              this.saveFunc(result);

              writeFile(result.filePath, content, (err) => {
                if (err) logError(err);
              });
            } catch (err) {
              this.saveFunc('data error');
              logError('file is not saved', err);
            }
          },
        },
        {
          label: 'SaveAs',
          accelerator: 'CmdOrCtrl + A',
        },
        {
          label: 'Insert File as Group',
          async click() {
            try {
              const files = await dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: [{ name: 'text', extensions: ['txt'] }],
              });

              logMenuEvent(files);

              for (const file of files.filePaths) {
                logMenuEvent(readFileSync(file).toString());
              }
            } catch (err) {
              logError('file is not selected', err);
            }
          },
        },
        {
          label: 'Dimensional Analysis',
          click() {
            createMenuPopUpWithRouting({
              width: 240,
              height: 153,
              title: '',
              url: `${rendererAppURL}/#/menu/file/dimensional-analysis`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
          label: 'Export Canvas',
        },
        {
          label: 'Export Plots',
          submenu: [
            {
              label: 'as SVG',
            },
            {
              label: 'as CSV',
            },
          ],
        },
        {
          label: 'Log simulation',
          click() {
            createMenuPopUpWithRouting({
              width: 250,
              height: 500,
              title: 'Log simulation',
              url: `${rendererAppURL}/#/menu/file/log-simulation`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
          label: 'Recording',
        },
        {
          label: 'Replay recording',
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl + Q',
          role: 'quit',
        },
        {
          type: 'separator',
        },
        {
          label: 'Debugging Use',
        },
        {
          label: 'Redraw',
        },
        {
          label: 'Object Browser',
          click() {
            createMenuPopUpWithRouting({
              width: 400,
              height: 230,
              title: '',
              url: `${rendererAppURL}/#/menu/file/object-browser`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
          label: 'Select items',
          click() {
            createMenuPopUpWithRouting({
              width: 290,
              height: 153,
              title: '',
              url: `${rendererAppURL}/#/menu/file/select-items`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
          label: 'Command',
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl + Z',
          click() {
            const numberOfTimes = 1;
            handleMinskyProcessAndRender({
              command: `${commandsMapping.UNDO} ${numberOfTimes}`,
            });
          },
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl + Y',
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl + Shift + X',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.CUT}`,
            });
          },
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl + Shift + C',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.COPY}`,
            });
          },
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl + Shift + V',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.PASTE}`,
            });
          },
        },
        {
          label: 'Group selection',
        },
        {
          label: 'Dimensions',
          click() {
            createMenuPopUpWithRouting({
              width: 420,
              height: 250,
              title: 'Dimensions',
              url: `${rendererAppURL}/#/menu/edit/dimensions`,
              backgroundColor: '#ffffff',
            });
          },
        },
      ],
    },
    {
      label: 'Bookmarks',
      id: 'main-bookmark',
      submenu: [
        {
          label: 'Bookmark this position',
          click() {
            handleMinskyProcess(null, {
              command: `${commandsMapping.ADD_BOOKMARK} "${Date.now()}"`,
            });

            handleMinskyProcess(null, {
              command: commandsMapping.BOOKMARK_LIST,
            });
          },
        },
        {
          label: 'Delete bookmark',
          id: 'delete-bookmark',
          submenu: [],
        },
        { type: 'separator' },
      ],
    },
    {
      label: 'Insert',
      submenu: [
        {
          label: 'plot',
          click() {
            handleMinskyProcessAndRender({
              command: commandsMapping.ADD_PLOT,
            });
          },
        },
        {
          label: 'Godley Table',
          click() {
            handleMinskyProcessAndRender({
              command: commandsMapping.ADD_GODLEY,
            });
          },
        },
        {
          // TODO:
          label: 'Variable',
          submenu: [
            {
              type: 'separator',
            },
            {
              label: 'variable',
              click() {
                createMenuPopUpWithRouting({
                  width: 500,
                  height: 550,
                  title: 'Specify variable name',
                  url: `${rendererAppURL}/#/menu/insert/create-variable`,
                  backgroundColor: '#ffffff',
                });
              },
            },
            {
              label: 'constant',
              click() {
                createMenuPopUpWithRouting({
                  width: 500,
                  height: 550,
                  title: 'Specify variable name',
                  url: `${rendererAppURL}/#/menu/insert/create-variable`,
                  backgroundColor: '#ffffff',
                });
              },
            },
            {
              label: 'parameter',
              click() {
                createMenuPopUpWithRouting({
                  width: 500,
                  height: 550,
                  title: 'Specify variable name',
                  url: `${rendererAppURL}/#/menu/insert/create-variable`,
                  backgroundColor: '#ffffff',
                });
              },
            },
          ],
        },
        {
          label: 'Binary Ops',
          submenu: [
            {
              label: 'add',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ADD}"`,
                });
              },
            },
            {
              label: 'subtract',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUBTRACT}"`,
                });
              },
            },
            {
              label: 'multiply',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MULTIPLY}"`,
                });
              },
            },
            {
              label: 'divide',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIVIDE}"`,
                });
              },
            },
            {
              label: 'min',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MIN}"`,
                });
              },
            },
            {
              label: 'max',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MAX}"`,
                });
              },
            },
            {
              label: 'and',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.AND_}"`,
                });
              },
            },
            {
              label: 'or',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OR_}"`,
                });
              },
            },
            {
              label: 'log',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LOG}"`,
                });
              },
            },
            {
              label: 'pow',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POW}"`,
                });
              },
            },
            {
              label: 'polygamma',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POLYGAMMA}"`,
                });
              },
            },
            {
              label: 'lt',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LT}"`,
                });
              },
            },
            {
              label: 'le',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LE}"`,
                });
              },
            },
            {
              label: 'eq',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.EQ}"`,
                });
              },
            },
          ],
        },
        {
          label: 'Functions',
          submenu: [
            {
              label: 'copy',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COPY}"`,
                });
              },
            },
            {
              label: 'sqrt',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SQRT}"`,
                });
              },
            },
            {
              label: 'exp',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.EXP}"`,
                });
              },
            },
            {
              label: 'ln',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LN}"`,
                });
              },
            },
            {
              label: 'sin',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SIN}"`,
                });
              },
            },
            {
              label: 'cos',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COS}"`,
                });
              },
            },
            {
              label: 'tan',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TAN}"`,
                });
              },
            },
            {
              label: 'asin',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ASIN}"`,
                });
              },
            },
            {
              label: 'acos',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ACOS}"`,
                });
              },
            },
            {
              label: 'atan',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ATAN}"`,
                });
              },
            },
            {
              label: 'sinh',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SINH}"`,
                });
              },
            },
            {
              label: 'cosh',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COSH}"`,
                });
              },
            },
            {
              label: 'tanh',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TANH}"`,
                });
              },
            },
            {
              label: 'abs',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ABS}"`,
                });
              },
            },
            {
              label: 'floor',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FLOOR}"`,
                });
              },
            },
            {
              label: 'frac',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FRAC}"`,
                });
              },
            },
            {
              label: 'not',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.NOT_}"`,
                });
              },
            },
            {
              label: 'gamma',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GAMMA}"`,
                });
              },
            },
            {
              label: 'fact',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FACT}"`,
                });
              },
            },
          ],
        },
        {
          label: 'Reductions',
          submenu: [
            {
              label: 'sum',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUM}"`,
                });
              },
            },
            {
              label: 'product',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.PRODUCT}"`,
                });
              },
            },
            {
              label: 'infimum',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INFIMUM}"`,
                });
              },
            },
            {
              label: 'supremum',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUPREMUM}"`,
                });
              },
            },
            {
              label: 'any',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ANY}"`,
                });
              },
            },
            {
              label: 'all',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ALL}"`,
                });
              },
            },
            {
              label: 'infIndex',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INF_INDEX}"`,
                });
              },
            },
            {
              label: 'supIndex',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUP_INDEX}"`,
                });
              },
            },
          ],
        },
        {
          label: 'Scans',
          submenu: [
            {
              label: 'runningSum',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_SUM}"`,
                });
              },
            },
            {
              label: 'runningProduct',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_PRODUCT}"`,
                });
              },
            },
            {
              label: 'difference',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIFFERENCE}"`,
                });
              },
            },
          ],
        },
        {
          label: 'Tensor operations',
          submenu: [
            {
              label: 'innerProduct',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INNER_PRODUCT}"`,
                });
              },
            },
            {
              label: 'outerProduct',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OUTER_PRODUCT}"`,
                });
              },
            },
            {
              label: 'index',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INDEX}"`,
                });
              },
            },
            {
              label: 'gather',
              click() {
                handleMinskyProcessAndRender({
                  command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GATHER}"`,
                });
              },
            },
          ],
        },
        {
          label: 'time',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TIME}"`,
            });
          },
        },
        {
          label: 'integrate',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INTEGRATE}"`,
            });
          },
        },
        {
          label: 'differentiate',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIFFERENTIATE}"`,
            });
          },
        },
        {
          label: 'data',
          click() {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DATA}"`,
            });
          },
        },
        {
          label: 'ravel',
          click() {
            handleMinskyProcessAndRender({
              command: commandsMapping.ADD_RAVEL,
            });
          },
        },
      ],
    },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Preferences',
          click() {
            createMenuPopUpWithRouting({
              width: 500,
              height: 450,
              title: 'Preferences',
              url: `${rendererAppURL}/#/menu/options/preferences`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
          label: 'Background Colour',
          click() {
            createMenuPopUpWithRouting({
              width: 450,
              height: 320,
              title: 'Background Colour',
              url: `${rendererAppURL}/#/menu/options/background-color`,
              backgroundColor: '#ffffff',
            });
          },
        },
      ],
    },
    {
      label: 'Runge Kutta',
      submenu: [
        {
          label: 'Runge Kutta',
          click() {
            createMenuPopUpWithRouting({
              width: 550,
              height: 550,
              title: 'Runge Kutta',
              url: `${rendererAppURL}/#/menu/runge-kutta/runge-kutta-parameters`,
              backgroundColor: '#ffffff',
            });
          },
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Minsky Documentation',
          click() {
            shell.openExternal(
              'https://minsky.sourceforge.io/manual/minsky.html'
            );
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

function populateBookmarks(bookmarkString: string) {
  const bookmarks: string[] = JSON.parse(bookmarkString.split('=>').pop());
  const mainSubmenu = Menu.getApplicationMenu().getMenuItemById('main-bookmark')
    .submenu;

  const deleteBookmarkSubmenu = Menu.getApplicationMenu()
    .getMenuItemById('main-bookmark')
    .submenu.getMenuItemById('delete-bookmark').submenu;

  const disableAllBookmarksInListAndDelete = () => {
    mainSubmenu.items.forEach((bookmark) => {
      if (bookmark.id === 'minsky-bookmark') {
        bookmark.visible = false;
      }
    });

    deleteBookmarkSubmenu.items.forEach((bookmark) => {
      if (bookmark.id === 'minsky-bookmark') {
        bookmark.visible = false;
      }
    });
  };

  const addNewBookmarks = () => {
    bookmarks.forEach((bookmark, index) => {
      mainSubmenu.append(
        new MenuItem({
          id: 'minsky-bookmark',
          label: bookmark,
          click: () => {
            handleMinskyProcessAndRender({
              command: `${commandsMapping.GOTO_BOOKMARK} ${index}`,
            });
          },
        })
      );

      deleteBookmarkSubmenu.append(
        new MenuItem({
          id: 'minsky-bookmark',
          label: bookmark,
          click: () => {
            handleMinskyProcess(null, {
              command: `${commandsMapping.DELETE_BOOKMARK} ${index}`,
            });

            handleMinskyProcess(null, {
              command: commandsMapping.BOOKMARK_LIST,
            });
          },
        })
      );
    });
  };

  disableAllBookmarksInListAndDelete();
  addNewBookmarks();
}

export function handleMinskyProcess(event, payload: MinskyProcessPayload) {
  if (App.minskyProcess) {
    executeCommandOnMinskyServer(App.minskyProcess, payload);
  } else if (!App.minskyProcess && payload.command === 'startMinskyProcess') {
    try {
      App.minskyRESTServicePath = payload.filePath;
      App.minskyProcess = spawn(App.minskyRESTServicePath);
      if (App.minskyProcess) {
        App.minskyProcess.stdout.on('data', (data) => {
          log.info(`stdout: ${data}`);

          activeWindows.forEach((aw) => {
            aw.context.webContents.send(
              'minsky-process-reply',
              `stdout: ${data}`
            );
          });

          if (
            data.toString().includes(minskyProcessReplyIndicators.BOOKMARK_LIST)
          ) {
            populateBookmarks(data.toString());
          }
        });

        App.minskyProcess.stderr.on('data', (data) => {
          log.info(`stderr: ${data}`);
          activeWindows.forEach((aw) => {
            aw.context.webContents.send(
              'minsky-process-reply',
              `stderr: ${data}`
            );
          });
        });

        App.minskyProcess.on('error', (error) => {
          log.info(`error: ${error.message}`);
          activeWindows.forEach((aw) => {
            aw.context.webContents.send(
              'minsky-process-reply',
              `error: ${error.message}`
            );
          });
        });

        App.minskyProcess.on('close', (code) => {
          log.info(`child process exited with code ${code}`);
        });

        dialog.showMessageBoxSync(App.mainWindow, {
          type: 'info',
          title: 'Minsky Service Started',
          message: 'You can now choose model files to be loaded',
        });
      }
    } catch {
      dialog.showErrorBox('Execution error', 'Could not execute chosen file');
      App.minskyProcess = null;
    }
  } else {
    logError('Please select the minsky executable first...');
  }
}

function addFileToRecentFiles(filepath: string) {
  const recentFiles = App.store.get('recentFiles');

  const exists = Boolean(recentFiles.find((f) => f === filepath));
  if (!exists) {
    recentFiles.push(filepath);
    App.store.set('recentFiles', recentFiles);
  }
}

export function executeCommandOnMinskyServer(
  minskyProcess: ChildProcess,
  payload: MinskyProcessPayload
) {
  const newLine = '\n';
  let stdinCommand = null;
  switch (payload.command) {
    case commandsMapping.LOAD:
      stdinCommand = `${payload.command} "${payload.filePath}"`;
      addFileToRecentFiles(payload.filePath);
      break;

    case commandsMapping.RENDER_FRAME:
      stdinCommand = `${payload.command} [${activeWindows.get(1).windowId}, ${
        App.leftOffset
      }, ${App.topOffset}]`;
      break;

    case commandsMapping.mousemove:
      stdinCommand = `${payload.command} [${payload.mouseX - App.leftOffset}, ${
        payload.mouseY - App.topOffset
      }]`;
      break;

    case commandsMapping.mousedown:
      stdinCommand = `${payload.command} [${payload.mouseX - App.leftOffset}, ${
        payload.mouseY - App.topOffset
      }]`;
      break;

    case commandsMapping.mouseup:
      stdinCommand = `${payload.command} [${payload.mouseX - App.leftOffset}, ${
        payload.mouseY - App.topOffset
      }]`;
      break;

    case commandsMapping.SET_GODLEY_ICON_RESOURCE:
      stdinCommand = `${payload.command} "${join(
        __dirname,
        'assets/godley.svg'
      )}"`;
      break;

    case commandsMapping.SET_GROUP_ICON_RESOURCE:
      stdinCommand = `${payload.command} "${join(
        __dirname,
        'assets/group.svg'
      )}"`;
      break;

    default:
      stdinCommand = payload.command;
      break;
  }
  if (stdinCommand) {
    log.silly(stdinCommand);
    minskyProcess.stdin.write(stdinCommand + newLine);
  }
}

export function handleMinskyProcessAndRender(payload: MinskyProcessPayload) {
  handleMinskyProcess(null, payload);
  render();
}

export function render() {
  const renderPayload: MinskyProcessPayload = {
    command: commandsMapping.RENDER_FRAME,
  };

  handleMinskyProcess(null, renderPayload);
}
