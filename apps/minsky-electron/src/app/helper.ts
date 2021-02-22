import { ActiveWindow, CairoPayload } from '@minsky/shared';
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
import * as storage from 'electron-json-storage';
import * as log from 'electron-log';
import { readFileSync, writeFile } from 'fs';
import App from './app';
import { activeWindows, rendererAppURL } from './constants';
import { getWindowId } from './windowHelper';

log.info(JSON.stringify(process.env, null, 2));
const logError = debug('minsky:electron_error');
const logMenuEvent = debug('minsky:electron_menu_logs');
const logWindows = debug('minsky:electron_windows');
const logChildProcessEvent = debug('minsky:electron_child_process');
const logCairo = debug('minsky:electron_cairo');

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
  const window = getMainWindow();

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
        logError(error);
      });
      const window = getMainWindow();

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

              const loadPayload: CairoPayload = {
                command: '/minsky/load',
                filepath: _dialog.filePaths[0].toString(),
              };
              const renderPayload: CairoPayload = {
                command: '/minsky/canvas/renderFrame',
              };

              handleCairo(null, loadPayload);

              handleCairo(null, renderPayload);
            } catch (error) {
              logError(error);
            }
          },
        },
        {
          label: 'Recent Files',
          submenu: [
            {
              label: 'TestFile',
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
          accelerator: 'Ctrl + Q',
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
          role: 'undo',
        },
        {
          label: 'Redo',
          role: 'redo',
        },
        {
          label: 'Cut',
          role: 'cut',
        },
        {
          label: 'Copy',
          role: 'copy',
        },
        {
          label: 'Paste',
          role: 'paste',
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
            createMenuPopUpWithRouting({
              width: 420,
              height: 200,
              title: 'Bookmark this position',
              url: `${rendererAppURL}/#/menu/bookmarks/bookmark-position`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
          label: 'Delete...',
          id: 'delete-bookmark',
          submenu: [],
        },
        {
          type: 'separator',
        },
      ],
    },
    {
      label: 'Insert',
      submenu: [
        {
          label: 'Godley Table',
          click() {
            createMenuPopUpWithRouting({
              width: 500,
              height: 550,
              title: 'Insert Godley Table',
              url: `${rendererAppURL}/#/menu/insert/godley-table`,
              backgroundColor: '#ffffff',
            });
          },
        },
        {
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
            },
            {
              label: 'subtract',
            },
            {
              label: 'multiple',
            },
            {
              label: 'divide',
            },
            {
              label: 'min',
            },
            {
              label: 'max',
            },
            {
              label: 'and',
            },
            {
              label: 'or',
            },
            {
              label: 'log',
            },
            {
              label: 'pow',
            },
            {
              label: 'lt',
            },
            {
              label: 'le',
            },
            {
              label: 'eq',
            },
          ],
        },
        {
          label: 'Functions',
          submenu: [
            {
              label: 'copy',
            },
            {
              label: 'sqrt',
            },
            {
              label: 'exp',
            },
            {
              label: 'ln',
            },
            {
              label: 'sin',
            },
            {
              label: 'cos',
            },
            {
              label: 'tan',
            },
            {
              label: 'asin',
            },
            {
              label: 'acos',
            },
            {
              label: 'atan',
            },
            {
              label: 'sinh',
            },
            {
              label: 'cosh',
            },
            {
              label: 'tanh',
            },
            {
              label: 'abs',
            },
            {
              label: 'floor',
            },
            {
              label: 'frac',
            },
            {
              label: 'not',
            },
          ],
        },
        {
          label: 'Reductions',
          submenu: [
            {
              label: 'sum',
            },
            {
              label: 'product',
            },
            {
              label: 'infimum',
            },
            {
              label: 'supremum',
            },
            {
              label: 'any',
            },
            {
              label: 'all',
            },
            {
              label: 'infIndex',
            },
            {
              label: 'supIndex',
            },
          ],
        },
        {
          label: 'Scans',
          submenu: [
            {
              label: 'runningSum',
            },
            {
              label: 'runningProduct',
            },
            {
              label: 'difference',
            },
          ],
        },
        {
          label: 'Tensor operations',
          submenu: [
            {
              label: 'innerProduct',
            },
            {
              label: 'outerProduct',
            },
            {
              label: 'index',
            },
            {
              label: 'gather',
            },
          ],
        },
        {
          label: 'time',
        },
        {
          label: 'integrate',
        },
        {
          label: 'differentiate',
        },
        {
          label: 'data',
        },
        {
          label: 'ravel',
        },
        {
          label: 'plot',
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

export function handleCairo(
  event: Electron.IpcMainEvent,
  payload: CairoPayload
) {
  let command: string;

  if (typeof event === 'string') {
    command = event;
  } else {
    command = payload.command;
  }

  logCairo(command);

  if (App.cairo) {
    executeCommandOnMinskyServer(App.cairo, payload);
  } else if (
    !App.cairo &&
    command === '/minsky/canvas/initializeNativeWindow'
  ) {
    try {
      App.cairo = spawn(payload.filepath);
      if (App.cairo) {
        App.cairo.stdout.on('data', (data) => {
          log.info(`stdout: ${data}`);
          // logChildProcessEvent(`stdout: ${data}`);
        });
        App.cairo.stderr.on('data', (data) => {
          log.info(`stderr: ${data}`);
        });
        App.cairo.on('error', (error) => {
          log.info(`error: ${error.message}`);
        });
        App.cairo.on('close', (code) => {
          log.info(`child process exited with code ${code}`);
        });

        executeCommandOnMinskyServer(App.cairo, payload);

        dialog.showMessageBoxSync(App.mainWindow, {
          type: 'info',
          title: 'Minsky Service Started',
          message: 'You can now choose model files to be loaded',
        });
      }
    } catch {
      dialog.showErrorBox('Execution error', 'Could not execute chosen file');

      App.cairo = null;
    }

    // Menu.getApplicationMenu()
    //   .items.find((i) => i.label === 'File')
    //   .submenu.items.find((i) => i.label === 'Open').enabled = true;
  } else {
    logError('Please select the minsky executable first...');
  }
}

export function executeCommandOnMinskyServer(
  cairo: ChildProcess,
  payload: CairoPayload
) {
  const newLine = '\n';
  let stdinCommand = null;
  switch (payload.command) {
    case '/minsky/canvas/initializeNativeWindow':
      stdinCommand = `${payload.command} [${activeWindows.get(1).windowId}, ${App.leftOffset}, ${App.topOffset}] ${newLine}`;
      break;

    case '/minsky/load':
      stdinCommand = `${payload.command} "${payload.filepath}"${newLine}`;
      break;

    case '/minsky/canvas/renderFrame':
      stdinCommand = `${payload.command}${newLine}`;
      break;

    default:
      break;
  }
  if(stdinCommand) {
    console.log(stdinCommand);
    cairo.stdin.write(stdinCommand);
  }

  log.silly(stdinCommand);
}
