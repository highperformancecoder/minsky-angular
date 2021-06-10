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
              await CommandsManager.createNewSystem();
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
                  filters: [
                    { name: '*.mky', extensions: ['mky'] },
                    { name: '*.rvl', extensions: ['rvl'] },
                    { name: '*.xml', extensions: ['xml'] },
                    { name: '*.*', extensions: ['*'] },
                  ],
                });

                const loadPayload: MinskyProcessPayload = {
                  command: '/minsky/load',
                  filePath: _dialog.filePaths[0].toString(),
                };

                await RestServiceManager.handleMinskyProcess(loadPayload);
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
              if (RestServiceManager.currentMinskyModelFilePath) {
                await RestServiceManager.handleMinskyProcess({
                  command: `${commandsMapping.SAVE}`,
                  filePath: RestServiceManager.currentMinskyModelFilePath,
                });
              } else {
                const saveDialog = await dialog.showSaveDialog({});

                if (saveDialog.canceled || !saveDialog.filePath) {
                  return;
                }

                await RestServiceManager.handleMinskyProcess({
                  command: commandsMapping.SAVE,
                  filePath: saveDialog.filePath,
                });
              }
            },
          },
          {
            label: 'SaveAs',
            accelerator: 'CmdOrCtrl + Shift + S',
            async click() {
              const saveDialog = await dialog.showSaveDialog({
                filters: [
                  { name: 'Minsky', extensions: ['mky'] },
                  { name: 'Ravel', extensions: ['rvl'] },
                  { name: 'All', extensions: ['*'] },
                ],
                defaultPath:
                  RestServiceManager.currentMinskyModelFilePath || '',
                properties: ['showOverwriteConfirmation'],
              });

              if (saveDialog.canceled || !saveDialog.filePath) {
                return;
              }

              await RestServiceManager.handleMinskyProcess({
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

                await RestServiceManager.handleMinskyProcess({
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
            click: async () => {
              const res = await RestServiceManager.handleMinskyProcess({
                command: commandsMapping.DIMENSIONAL_ANALYSIS,
              });

              if (res === '{}') {
                dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
                  type: 'info',
                  title: 'Dimensional Analysis',
                  message: 'Dimensional Analysis Passed',
                });
              } else {
                dialog.showErrorBox('Error', 'Dimensional Analysis Failed');
              }
            },
          },
          {
            label: 'Export Canvas as',
            submenu: [
              {
                label: 'SVG',
                click: async () => {
                  const filePath = await CommandsManager.getFilePathFromExportCanvasDialog(
                    'svg'
                  );

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_SVG} "${filePath}"`,
                  });
                },
              },
              {
                label: 'PDF',
                click: async () => {
                  const filePath = await CommandsManager.getFilePathFromExportCanvasDialog(
                    'pdf'
                  );

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_PDF} "${filePath}"`,
                  });
                },
              },
              {
                label: 'PostScript',
                click: async () => {
                  const filePath = await CommandsManager.getFilePathFromExportCanvasDialog(
                    'eps'
                  );

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_CANVAS_TO_PS} "${filePath}"`,
                  });
                },
              },
              {
                label: 'LaTeX',
                click: async () => {
                  const filePath = await CommandsManager.getFilePathFromExportCanvasDialog(
                    'tex'
                  );

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.LATEX} "${filePath}"`,
                  });
                },
              },
              {
                label: 'Matlab',
                click: async () => {
                  const filePath = await CommandsManager.getFilePathFromExportCanvasDialog(
                    'm'
                  );

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.MATLAB} "${filePath}"`,
                  });
                },
              },
            ],
          },
          {
            label: 'Export Plots as',
            submenu: [
              {
                label: 'SVG',
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

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_ALL_PLOTS_AS_SVG} "${filePath}"`,
                  });
                },
              },
              {
                label: 'CSV',
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

                  await RestServiceManager.handleMinskyProcess({
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
            enabled: false,
          },
          {
            label: 'Redraw',
            async click() {
              await RestServiceManager.handleMinskyProcess({
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
            async click() {
              const numberOfTimes = -1;
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.UNDO} ${numberOfTimes}`,
              });
            },
          },
          {
            label: 'Redo',
            accelerator: 'CmdOrCtrl + Y',
            async click() {
              const numberOfTimes = 1;
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.REDO} ${numberOfTimes}`,
              });
            },
          },
          {
            label: 'Cut',
            accelerator: 'CmdOrCtrl + Shift + X',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.CUT}`,
              });
            },
          },
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl + Shift + C',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.COPY}`,
              });
            },
          },
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl + Shift + V',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.PASTE}`,
              });
            },
          },
          {
            label: 'Group selection',
            async click() {
              await RestServiceManager.handleMinskyProcess({
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
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.REMOVE_UNITS}`,
              });
            },
          },
          {
            label: 'Auto Layout',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.AUTO_LAYOUT}`,
              });
            },
          },
          {
            label: 'Random Layout',
            async click() {
              await RestServiceManager.handleMinskyProcess({
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
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: commandsMapping.ADD_PLOT,
              });
            },
          },
          {
            label: 'Godley Table',
            async click() {
              await RestServiceManager.handleMinskyProcess({
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
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ADD}"`,
                  });
                },
              },
              {
                label: 'subtract',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUBTRACT}"`,
                  });
                },
              },
              {
                label: 'multiply',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MULTIPLY}"`,
                  });
                },
              },
              {
                label: 'divide',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIVIDE}"`,
                  });
                },
              },
              {
                label: 'min',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MIN}"`,
                  });
                },
              },
              {
                label: 'max',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.MAX}"`,
                  });
                },
              },
              {
                label: 'and',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.AND_}"`,
                  });
                },
              },
              {
                label: 'or',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OR_}"`,
                  });
                },
              },
              {
                label: 'log',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LOG}"`,
                  });
                },
              },
              {
                label: 'pow',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POW}"`,
                  });
                },
              },
              {
                label: 'polygamma',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.POLYGAMMA}"`,
                  });
                },
              },
              {
                label: 'lt',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LT}"`,
                  });
                },
              },
              {
                label: 'le',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LE}"`,
                  });
                },
              },
              {
                label: 'eq',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
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
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COPY}"`,
                  });
                },
              },
              {
                label: 'sqrt',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SQRT}"`,
                  });
                },
              },
              {
                label: 'exp',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.EXP}"`,
                  });
                },
              },
              {
                label: 'ln',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.LN}"`,
                  });
                },
              },
              {
                label: 'sin',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SIN}"`,
                  });
                },
              },
              {
                label: 'cos',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COS}"`,
                  });
                },
              },
              {
                label: 'tan',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TAN}"`,
                  });
                },
              },
              {
                label: 'asin',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ASIN}"`,
                  });
                },
              },
              {
                label: 'acos',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ACOS}"`,
                  });
                },
              },
              {
                label: 'atan',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ATAN}"`,
                  });
                },
              },
              {
                label: 'sinh',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SINH}"`,
                  });
                },
              },
              {
                label: 'cosh',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.COSH}"`,
                  });
                },
              },
              {
                label: 'tanh',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TANH}"`,
                  });
                },
              },
              {
                label: 'abs',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ABS}"`,
                  });
                },
              },
              {
                label: 'floor',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FLOOR}"`,
                  });
                },
              },
              {
                label: 'frac',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.FRAC}"`,
                  });
                },
              },
              {
                label: 'not',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.NOT_}"`,
                  });
                },
              },
              {
                label: 'gamma',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GAMMA}"`,
                  });
                },
              },
              {
                label: 'fact',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
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
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUM}"`,
                  });
                },
              },
              {
                label: 'product',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.PRODUCT}"`,
                  });
                },
              },
              {
                label: 'infimum',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INFIMUM}"`,
                  });
                },
              },
              {
                label: 'supremum',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.SUPREMUM}"`,
                  });
                },
              },
              {
                label: 'any',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ANY}"`,
                  });
                },
              },
              {
                label: 'all',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.ALL}"`,
                  });
                },
              },
              {
                label: 'infIndex',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INF_INDEX}"`,
                  });
                },
              },
              {
                label: 'supIndex',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
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
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_SUM}"`,
                  });
                },
              },
              {
                label: 'runningProduct',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.RUNNING_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'difference',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
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
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INNER_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'outerProduct',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.OUTER_PRODUCT}"`,
                  });
                },
              },
              {
                label: 'index',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INDEX}"`,
                  });
                },
              },
              {
                label: 'gather',
                async click() {
                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.ADD_OPERATION} "${availableOperations.GATHER}"`,
                  });
                },
              },
            ],
          },
          {
            label: 'time',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.TIME}"`,
              });
            },
          },
          {
            label: 'integrate',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.INTEGRATE}"`,
              });
            },
          },
          {
            label: 'differentiate',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DIFFERENTIATE}"`,
              });
            },
          },
          {
            label: 'data',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.ADD_OPERATION} "${availableOperations.DATA}"`,
              });
            },
          },
          {
            label: 'ravel',
            async click() {
              await RestServiceManager.handleMinskyProcess({
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
