import {
  availableOperations,
  commandsMapping,
  MinskyProcessPayload,
  rendererAppURL,
} from '@minsky/shared';
import * as debug from 'debug';
import { dialog, Menu, shell } from 'electron';
import { CommandsManager } from './commandsManager';
import { RestServiceManager } from './restServiceManager';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';

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
                url: `${rendererAppURL}/#/headless/menu/file/about`,
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
            accelerator: 'CmdOrCtrl + Shift + N',
            async click() {
              if (RestServiceManager.isCanvasEdited) {
                const saveModelDialog = await dialog.showSaveDialog({
                  title: 'Save??',
                  properties: ['showOverwriteConfirmation', 'createDirectory'],
                });

                const { canceled, filePath } = saveModelDialog;
                if (canceled || !filePath) {
                  return;
                }

                RestServiceManager.handleMinskyProcess({
                  command: `${commandsMapping.SAVE} "${filePath}"`,
                });
              }

              // ??? deleteSubsidiaryTopLevels -> close all the windows
              WindowManager.activeWindows.forEach((window) => {
                if (!window.isMainWindow) {
                  window.context.close();
                }
              });

              // {window management -> set window title to new system}
              // global fname progName
              // set fname ""
              // wm title . "$progName: New System"
              WindowManager.getMainWindow().setTitle('New System');

              const newSystemCommands = [
                `${commandsMapping.PUSH_HISTORY} 0`,
                commandsMapping.CLEAR_ALL_MAPS,
                commandsMapping.PUSH_FLAGS,
                commandsMapping.CLEAR_HISTORY,
                `${commandsMapping.SET_ZOOM} 1`,
                commandsMapping.RECENTER,
                commandsMapping.POP_FLAGS,
                `${commandsMapping.PUSH_HISTORY} 1`,
              ];

              newSystemCommands.forEach((command) =>
                RestServiceManager.handleMinskyProcess({ command })
              );
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

                RestServiceManager.handleMinskyProcess(loadPayload);
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
              if (RestServiceManager.minskyProcess) {
                if (RestServiceManager.currentMinskyModelFilePath) {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.SAVE}`,
                    filePath: RestServiceManager.currentMinskyModelFilePath,
                  });
                } else {
                  const saveDialog = await dialog.showSaveDialog({});

                  if (saveDialog.canceled || !saveDialog.filePath) {
                    return;
                  }

                  RestServiceManager.handleMinskyProcess({
                    command: commandsMapping.SAVE,
                    filePath: saveDialog.filePath,
                  });
                }
              }
            },
          },
          {
            label: 'SaveAs',
            accelerator: 'CmdOrCtrl + Shift + S',
            async click() {
              const saveDialog = await dialog.showSaveDialog({});

              if (saveDialog.canceled || !saveDialog.filePath) {
                return;
              }

              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.SAVE} "${saveDialog.filePath}"`,
              });

              RestServiceManager.currentMinskyModelFilePath =
                saveDialog.filePath;
            },
          },
          {
            label: 'Insert File as Group',
            async click() {
              try {
                const insertGroupDialog = await dialog.showOpenDialog({
                  properties: ['openFile'],
                });

                RestServiceManager.handleMinskyProcess({
                  command: `${
                    commandsMapping.INSERT_GROUP_FROM_FILE
                  } "${insertGroupDialog.filePaths[0].toString()}"}`,
                });
              } catch (err) {
                logError('file is not selected', err);
              }
            },
          },
          {
            label: 'Dimensional Analysis',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.DIMENSIONAL_ANALYSIS,
              });
            },
          },
          {
            label: 'Export Canvas',
            async click() {
              const exportCanvasDialog = await dialog.showSaveDialog({
                title: 'Export canvas as...',
                defaultPath: 'export.svg',
                properties: ['showOverwriteConfirmation', 'createDirectory'],
                filters: [
                  { extensions: ['svg'], name: 'SVG' },
                  { extensions: ['pdf'], name: 'PDF' },
                  { extensions: ['eps'], name: 'PostScript' },
                  { extensions: ['tex'], name: 'LaTeX' },
                  { extensions: ['m'], name: 'Matlab' },
                ],
              });

              const { canceled, filePath } = exportCanvasDialog;
              if (canceled || !filePath) {
                return;
              }

              const extension = filePath.split('.').pop();

              switch (extension?.toLowerCase()) {
                case 'svg':
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_SVG} "${filePath}"`,
                  });
                  break;

                case 'pdf':
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_PDF} "${filePath}"`,
                  });
                  break;

                case 'eps':
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_PS} "${filePath}"`,
                  });
                  break;

                case 'tex':
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_PNG} "${filePath}"`,
                  });
                  break;

                case 'm':
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_EMF} "${filePath}"`,
                  });
                  break;

                default:
                  break;
              }
            },
          },
          {
            label: 'Export Plots',
            submenu: [
              {
                label: 'as SVG',
                async click() {
                  const exportPlotDialog = await dialog.showSaveDialog({
                    title: 'Export plot as svg',
                    defaultPath: 'plot',
                    properties: [
                      'showOverwriteConfirmation',
                      'createDirectory',
                    ],
                    filters: [{ extensions: ['svg'], name: 'SVG' }],
                  });

                  const { canceled, filePath } = exportPlotDialog;

                  if (canceled || !filePath) {
                    return;
                  }

                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_ALL_PLOTS_AS_SVG} "${filePath}"`,
                  });
                },
              },
              {
                label: 'as CSV',
                async click() {
                  const exportPlotDialog = await dialog.showSaveDialog({
                    title: 'Export plot as csv',
                    defaultPath: 'plot',
                    properties: [
                      'showOverwriteConfirmation',
                      'createDirectory',
                    ],
                    filters: [{ extensions: ['csv'], name: 'CSV' }],
                  });

                  const { canceled, filePath } = exportPlotDialog;

                  if (canceled || !filePath) {
                    return;
                  }

                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.EXPORT_ALL_PLOTS_AS_CSV} "${filePath}"`,
                  });
                },
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
                url: `${rendererAppURL}/#/headless/menu/file/log-simulation`,
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
            click() {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.REDRAW,
              });
            },
          },
          {
            label: 'Object Browser',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 400,
                height: 230,
                title: '',
                url: `${rendererAppURL}/#/headless/menu/file/object-browser`,
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
                url: `${rendererAppURL}/#/headless/menu/file/select-items`,
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
              const numberOfTimes = -1;
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.UNDO} ${numberOfTimes}`,
              });
            },
          },
          {
            label: 'Redo',
            accelerator: 'CmdOrCtrl + Y',
            click() {
              const numberOfTimes = 1;
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.REDO} ${numberOfTimes}`,
              });
            },
          },
          {
            label: 'Cut',
            accelerator: 'CmdOrCtrl + Shift + X',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.CUT}`,
              });
            },
          },
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl + Shift + C',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.COPY}`,
              });
            },
          },
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl + Shift + V',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.PASTE}`,
              });
            },
          },
          {
            label: 'Group selection',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.GROUP_SELECTION}`,
              });
            },
          },
          {
            label: 'Dimensions',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 420,
                height: 250,
                title: 'Dimensions',
                url: `${rendererAppURL}/#/headless/menu/edit/dimensions`,
              });
            },
          },
          {
            label: 'Remove Units',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.REMOVE_UNITS}`,
              });
            },
          },
          {
            label: 'Auto Layout',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.AUTO_LAYOUT}`,
              });
            },
          },
          {
            label: 'Random Layout',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.RANDOM_LAYOUT}`,
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
              CommandsManager.bookmarkThisPosition();
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
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.ADD_PLOT,
              });
            },
          },
          {
            label: 'Godley Table',
            click() {
              RestServiceManager.handleMinskyProcess({
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
                    url: `${rendererAppURL}/#/headless/menu/insert/create-variable/flow`,
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
                    url: `${rendererAppURL}/#/headless/menu/insert/create-variable/constant`,
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
                    url: `${rendererAppURL}/#/headless/menu/insert/create-variable/parameter`,
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
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ADD}"`,
                  });
                },
              },
              {
                label: 'subtract',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUBTRACT}"`,
                  });
                },
              },
              {
                label: 'multiply',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MULTIPLY}"`,
                  });
                },
              },
              {
                label: 'divide',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIVIDE}"`,
                  });
                },
              },
              {
                label: 'min',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MIN}"`,
                  });
                },
              },
              {
                label: 'max',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MAX}"`,
                  });
                },
              },
              {
                label: 'and',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.AND_}"`,
                  });
                },
              },
              {
                label: 'or',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OR_}"`,
                  });
                },
              },
              {
                label: 'log',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LOG}"`,
                  });
                },
              },
              {
                label: 'pow',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POW}"`,
                  });
                },
              },
              {
                label: 'polygamma',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POLYGAMMA}"`,
                  });
                },
              },
              {
                label: 'lt',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LT}"`,
                  });
                },
              },
              {
                label: 'le',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LE}"`,
                  });
                },
              },
              {
                label: 'eq',
                click() {
                  RestServiceManager.handleMinskyProcess({
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
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COPY}"`,
                  });
                },
              },
              {
                label: 'sqrt',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SQRT}"`,
                  });
                },
              },
              {
                label: 'exp',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.EXP}"`,
                  });
                },
              },
              {
                label: 'ln',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LN}"`,
                  });
                },
              },
              {
                label: 'sin',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SIN}"`,
                  });
                },
              },
              {
                label: 'cos',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COS}"`,
                  });
                },
              },
              {
                label: 'tan',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TAN}"`,
                  });
                },
              },
              {
                label: 'asin',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ASIN}"`,
                  });
                },
              },
              {
                label: 'acos',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ACOS}"`,
                  });
                },
              },
              {
                label: 'atan',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ATAN}"`,
                  });
                },
              },
              {
                label: 'sinh',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SINH}"`,
                  });
                },
              },
              {
                label: 'cosh',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COSH}"`,
                  });
                },
              },
              {
                label: 'tanh',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TANH}"`,
                  });
                },
              },
              {
                label: 'abs',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ABS}"`,
                  });
                },
              },
              {
                label: 'floor',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FLOOR}"`,
                  });
                },
              },
              {
                label: 'frac',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FRAC}"`,
                  });
                },
              },
              {
                label: 'not',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.NOT_}"`,
                  });
                },
              },
              {
                label: 'gamma',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GAMMA}"`,
                  });
                },
              },
              {
                label: 'fact',
                click() {
                  RestServiceManager.handleMinskyProcess({
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
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUM}"`,
                  });
                },
              },
              {
                label: 'product',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.PRODUCT}"`,
                  });
                },
              },
              {
                label: 'infimum',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INFIMUM}"`,
                  });
                },
              },
              {
                label: 'supremum',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUPREMUM}"`,
                  });
                },
              },
              {
                label: 'any',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ANY}"`,
                  });
                },
              },
              {
                label: 'all',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ALL}"`,
                  });
                },
              },
              {
                label: 'infIndex',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INF_INDEX}"`,
                  });
                },
              },
              {
                label: 'supIndex',
                click() {
                  RestServiceManager.handleMinskyProcess({
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
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_SUM}"`,
                  });
                },
              },
              {
                label: 'runningProduct',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'difference',
                click() {
                  RestServiceManager.handleMinskyProcess({
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
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INNER_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'outerProduct',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OUTER_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'index',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INDEX}"`,
                  });
                },
              },
              {
                label: 'gather',
                click() {
                  RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GATHER}"`,
                  });
                },
              },
            ],
          },
          {
            label: 'time',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TIME}"`,
              });
            },
          },
          {
            label: 'integrate',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INTEGRATE}"`,
              });
            },
          },
          {
            label: 'differentiate',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIFFERENTIATE}"`,
              });
            },
          },
          {
            label: 'data',
            click() {
              RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DATA}"`,
              });
            },
          },
          {
            label: 'ravel',
            click() {
              RestServiceManager.handleMinskyProcess({
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
                url: `${rendererAppURL}/#/headless/menu/options/preferences`,
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
                url: `${rendererAppURL}/#/headless/menu/options/background-color`,
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
                url: `${rendererAppURL}/#/headless/menu/simulation/simulation-parameters`,
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
