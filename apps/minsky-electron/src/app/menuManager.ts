import {
  availableOperations,
  commandsMapping,
  MinskyProcessPayload,
  rendererAppURL,
} from '@minsky/shared';
import * as debug from 'debug';
import { dialog, Menu, shell } from 'electron';
import { readFileSync, writeFile } from 'fs';
import { RestServiceManager } from './restServiceManager';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';

const logMenuEvent = debug('minsky:electron_menu_logs');
const logError = debug('minsky:electron_error');

export class MenuManager {
  static createMenu() {
    const menu = Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'About Minsky',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 420,
                height: 440,
                title: '',
                url: `${rendererAppURL}/#/menu/file/about`,
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

                RestServiceManager.handleMinskyProcessAndRender(loadPayload);
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
                  StoreManager.store.set('recentFiles', []);
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
              RestServiceManager.handleMinskyProcessAndRender({
                command: commandsMapping.DIMENSIONAL_ANALYSIS,
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
              WindowManager.createMenuPopUpWithRouting({
                width: 250,
                height: 500,
                title: 'Log simulation',
                url: `${rendererAppURL}/#/menu/file/log-simulation`,
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
              WindowManager.createMenuPopUpWithRouting({
                width: 400,
                height: 230,
                title: '',
                url: `${rendererAppURL}/#/menu/file/object-browser`,
              });
            },
          },
          {
            label: 'Select items',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 290,
                height: 153,
                title: '',
                url: `${rendererAppURL}/#/menu/file/select-items`,
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
              RestServiceManager.handleMinskyProcessAndRender({
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
              RestServiceManager.handleMinskyProcessAndRender({
                command: `${commandsMapping.CUT}`,
              });
            },
          },
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl + Shift + C',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
                command: `${commandsMapping.COPY}`,
              });
            },
          },
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl + Shift + V',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
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
              WindowManager.createMenuPopUpWithRouting({
                width: 420,
                height: 250,
                title: 'Dimensions',
                url: `${rendererAppURL}/#/menu/edit/dimensions`,
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
              WindowManager.createMenuPopUpWithRouting({
                width: 420,
                height: 250,
                title: 'Bookmarks',
                url: `${rendererAppURL}/#/menu/bookmarks/add-bookmark`,
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
              RestServiceManager.handleMinskyProcessAndRender({
                command: commandsMapping.ADD_PLOT,
              });
            },
          },
          {
            label: 'Godley Table',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
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
                  WindowManager.createMenuPopUpWithRouting({
                    width: 500,
                    height: 550,
                    title: 'Specify variable name',
                    url: `${rendererAppURL}/#/menu/insert/create-variable/flow`,
                  });
                },
              },
              {
                label: 'constant',
                click() {
                  WindowManager.createMenuPopUpWithRouting({
                    width: 500,
                    height: 550,
                    title: 'Specify variable name',
                    url: `${rendererAppURL}/#/menu/insert/create-variable/constant`,
                  });
                },
              },
              {
                label: 'parameter',
                click() {
                  WindowManager.createMenuPopUpWithRouting({
                    width: 500,
                    height: 550,
                    title: 'Specify variable name',
                    url: `${rendererAppURL}/#/menu/insert/create-variable/parameter`,
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
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ADD}"`,
                  });
                },
              },
              {
                label: 'subtract',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUBTRACT}"`,
                  });
                },
              },
              {
                label: 'multiply',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MULTIPLY}"`,
                  });
                },
              },
              {
                label: 'divide',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIVIDE}"`,
                  });
                },
              },
              {
                label: 'min',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MIN}"`,
                  });
                },
              },
              {
                label: 'max',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MAX}"`,
                  });
                },
              },
              {
                label: 'and',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.AND_}"`,
                  });
                },
              },
              {
                label: 'or',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OR_}"`,
                  });
                },
              },
              {
                label: 'log',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LOG}"`,
                  });
                },
              },
              {
                label: 'pow',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POW}"`,
                  });
                },
              },
              {
                label: 'polygamma',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POLYGAMMA}"`,
                  });
                },
              },
              {
                label: 'lt',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LT}"`,
                  });
                },
              },
              {
                label: 'le',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LE}"`,
                  });
                },
              },
              {
                label: 'eq',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
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
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COPY}"`,
                  });
                },
              },
              {
                label: 'sqrt',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SQRT}"`,
                  });
                },
              },
              {
                label: 'exp',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.EXP}"`,
                  });
                },
              },
              {
                label: 'ln',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LN}"`,
                  });
                },
              },
              {
                label: 'sin',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SIN}"`,
                  });
                },
              },
              {
                label: 'cos',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COS}"`,
                  });
                },
              },
              {
                label: 'tan',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TAN}"`,
                  });
                },
              },
              {
                label: 'asin',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ASIN}"`,
                  });
                },
              },
              {
                label: 'acos',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ACOS}"`,
                  });
                },
              },
              {
                label: 'atan',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ATAN}"`,
                  });
                },
              },
              {
                label: 'sinh',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SINH}"`,
                  });
                },
              },
              {
                label: 'cosh',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COSH}"`,
                  });
                },
              },
              {
                label: 'tanh',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TANH}"`,
                  });
                },
              },
              {
                label: 'abs',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ABS}"`,
                  });
                },
              },
              {
                label: 'floor',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FLOOR}"`,
                  });
                },
              },
              {
                label: 'frac',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FRAC}"`,
                  });
                },
              },
              {
                label: 'not',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.NOT_}"`,
                  });
                },
              },
              {
                label: 'gamma',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GAMMA}"`,
                  });
                },
              },
              {
                label: 'fact',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
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
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUM}"`,
                  });
                },
              },
              {
                label: 'product',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.PRODUCT}"`,
                  });
                },
              },
              {
                label: 'infimum',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INFIMUM}"`,
                  });
                },
              },
              {
                label: 'supremum',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUPREMUM}"`,
                  });
                },
              },
              {
                label: 'any',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ANY}"`,
                  });
                },
              },
              {
                label: 'all',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ALL}"`,
                  });
                },
              },
              {
                label: 'infIndex',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INF_INDEX}"`,
                  });
                },
              },
              {
                label: 'supIndex',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
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
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_SUM}"`,
                  });
                },
              },
              {
                label: 'runningProduct',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'difference',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
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
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INNER_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'outerProduct',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OUTER_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'index',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INDEX}"`,
                  });
                },
              },
              {
                label: 'gather',
                click() {
                  RestServiceManager.handleMinskyProcessAndRender({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GATHER}"`,
                  });
                },
              },
            ],
          },
          {
            label: 'time',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TIME}"`,
              });
            },
          },
          {
            label: 'integrate',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INTEGRATE}"`,
              });
            },
          },
          {
            label: 'differentiate',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIFFERENTIATE}"`,
              });
            },
          },
          {
            label: 'data',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DATA}"`,
              });
            },
          },
          {
            label: 'ravel',
            click() {
              RestServiceManager.handleMinskyProcessAndRender({
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
              WindowManager.createMenuPopUpWithRouting({
                width: 500,
                height: 450,
                title: 'Preferences',
                url: `${rendererAppURL}/#/menu/options/preferences`,
              });
            },
          },
          {
            label: 'Background Colour',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 450,
                height: 320,
                title: 'Background Colour',
                url: `${rendererAppURL}/#/menu/options/background-color`,
              });
            },
          },
        ],
      },
      {
        label: 'Simulation',
        submenu: [
          {
            label: 'Simulation',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 550,
                height: 550,
                title: 'Simulation',
                url: `${rendererAppURL}/#/menu/simulation/simulation-parameters`,
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
}
