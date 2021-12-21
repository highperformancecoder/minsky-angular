import {
  availableOperations,
  CanvasItem,
  GodleyTableOutputStyles,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
  commandsMapping,
  normalizeFilePathForPlatform,
  ClassType,
} from '@minsky/shared';
import { join } from 'path';
import * as debug from 'debug';
import {
  dialog,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  shell,
} from 'electron';
import * as JSON5 from 'json5';
import { Utility } from '../utility';
import { CommandsManager } from './CommandsManager';
import { HelpFilesManager } from './HelpFilesManager';
import { RestServiceManager } from './RestServiceManager';
import { StoreManager } from './StoreManager';
import { WindowManager } from './WindowManager';

const logError = debug('minsky:electron_error');


const GodleyPopupMenuItemIds = {
  toggleMultipleEquities: 'multiple-equity-column-toggler',
};

export class MenuManager {
  public static createMainApplicationMenu() {
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
                url: `#/headless/menu/file/about`,
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

                if (_dialog.canceled || !_dialog.filePaths) {
                  return;
                }
                const filePath = _dialog.filePaths[0].toString();
                await CommandsManager.openNamedFile(filePath);
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
                await CommandsManager.saveFile(RestServiceManager.currentMinskyModelFilePath);
              } else {
                const saveDialog = await dialog.showSaveDialog({});

                const { canceled, filePath: _filePath } = saveDialog;
                const filePath = normalizeFilePathForPlatform(_filePath);

                if (canceled || !filePath) {
                  return;
                }


                await RestServiceManager.handleMinskyProcess({
                  command: commandsMapping.SAVE,
                  filePath,
                });
              }
            },
          },
          {
            label: 'Save As',
            accelerator: 'CmdOrCtrl + Shift + S',
            async click() {
              const defaultExtension = (await RestServiceManager.handleMinskyProcess(
                { command: commandsMapping.DEFAULT_EXTENSION }
              )) as string;
              const saveDialog = await dialog.showSaveDialog({
                filters: [
                  {
                    name: defaultExtension,
                    extensions: [defaultExtension.slice(1)],
                  },
                  { name: 'All', extensions: ['*'] },
                ],
                defaultPath:
                  RestServiceManager.currentMinskyModelFilePath ||
                  `model${defaultExtension}`,
                properties: ['showOverwriteConfirmation'],
              });

              const { canceled, filePath: _filePath } = saveDialog;
              const filePath = normalizeFilePathForPlatform(_filePath);

              if (canceled || !filePath) {
                return;
              }

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.SAVE} ${filePath}`,
              });

              RestServiceManager.currentMinskyModelFilePath = filePath;
            },
          },
          {
            label: 'Insert File as Group',
            async click() {
              try {
                const insertGroupDialog = await dialog.showOpenDialog({
                  properties: ['openFile'],
                });

                const filePath = normalizeFilePathForPlatform(
                  insertGroupDialog.filePaths[0].toString()
                );

                await RestServiceManager.handleMinskyProcess({
                  command: `${commandsMapping.INSERT_GROUP_FROM_FILE} ${filePath}`,
                });
                await CommandsManager.requestRedraw();
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

              if (JSON5.stringify(res) === JSON5.stringify({})) {
                dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
                  type: 'info',
                  title: 'Dimensional Analysis',
                  message: 'Dimensional Analysis Passed',
                });
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
                    command: `${commandsMapping.RENDER_CANVAS_TO_SVG} ${filePath}`,
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
                    command: `${commandsMapping.RENDER_CANVAS_TO_PDF} ${filePath}`,
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
                    command: `${commandsMapping.RENDER_CANVAS_TO_PS} ${filePath}`,
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
                    command: `${commandsMapping.LATEX} [${filePath},${
                      StoreManager.store.get('preferences')
                        .wrapLongEquationsInLatexExport
                    }]`,
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
                    command: `${commandsMapping.MATLAB} ${filePath}`,
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

                  const { canceled, filePath: _filePath } = exportPlotDialog;
                  const filePath = normalizeFilePathForPlatform(_filePath);

                  if (canceled || !filePath) {
                    return;
                  }

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.RENDER_ALL_PLOTS_AS_SVG} ${filePath}`,
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

                  const { canceled, filePath: _filePath } = exportPlotDialog;
                  const filePath = normalizeFilePathForPlatform(_filePath);

                  if (canceled || !filePath) {
                    return;
                  }

                  await RestServiceManager.handleMinskyProcess({
                    command: `${commandsMapping.EXPORT_ALL_PLOTS_AS_CSV} ${filePath}`,
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
                height: 600,
                title: 'Log simulation',
                url: `#/headless/menu/file/log-simulation`,
              });
            },
          },
          {
            label: 'Recording',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: commandsMapping.RECORD,
              });
            },
          },
          {
            label: 'Replay recording',
            async click() {
              await RestServiceManager.handleMinskyProcess({
                command: commandsMapping.RECORDING_REPLAY,
              });
            },
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
              console.log(
                'File menu: Redraw: ' + commandsMapping.RENDER_FRAME_SUBCOMMAND
              );
              await RestServiceManager.handleMinskyProcess({
                //command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
                command: commandsMapping.RENDER_FRAME_SUBCOMMAND,
              });
            },
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
              const numberOfTimes = 1;
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.UNDO} ${numberOfTimes}`,
              });
              await CommandsManager.requestRedraw();
            },
          },
          {
            label: 'Redo',
            accelerator: 'CmdOrCtrl + Y',
            async click() {
              const numberOfTimes = -1;
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.REDO} ${numberOfTimes}`,
              });

              await CommandsManager.requestRedraw();
            },
          },
          {
            label: 'Cut',
            accelerator: 'CmdOrCtrl + X',
            async click() {
              await CommandsManager.cut();
            },
          },
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl + C',
            async click() {
              await CommandsManager.copy();
            },
          },
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl + V',
            async click() {
              await CommandsManager.paste();
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
                width: 700,
                height: 500,
                title: 'Dimensions',
                url: `#/headless/menu/edit/dimensions`,
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
              WindowManager.getMainWindow().webContents.insertCSS(
                `body { cursor: wait; }`
              );
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.AUTO_LAYOUT}`,
              });
              WindowManager.getMainWindow().webContents.insertCSS(
                `body { cursor: default; }`
              );
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
        id: 'insert',
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
                    height: 650,
                    title: 'Specify variable name',
                    url: `#/headless/menu/insert/create-variable?type=flow`,
                  });
                },
              },
              {
                label: 'constant',
                click() {
                  WindowManager.createMenuPopUpWithRouting({
                    width: 500,
                    height: 650,
                    title: 'Specify variable name',
                    url: `#/headless/menu/insert/create-variable?type=constant`,
                  });
                },
              },
              {
                label: 'parameter',
                click() {
                  WindowManager.createMenuPopUpWithRouting({
                    width: 500,
                    height: 650,
                    title: 'Specify variable name',
                    url: `#/headless/menu/insert/create-variable?type=parameter`,
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
                url: `#/headless/menu/options/preferences`,
              });
            },
          },
          {
            label: 'Background Colour',
            click() {
              WindowManager.createMenuPopUpWithRouting({
                width: 450,
                height: 620,
                title: 'Background Colour',
                url: `#/headless/menu/options/background-color`,
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
                url: `#/headless/menu/simulation/simulation-parameters`,
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




  private static async toggleMultipleEquitiesColumn() {
    const preferences = StoreManager.store.get('preferences');
    const { enableMultipleEquityColumns } = preferences;
    const newValue = !enableMultipleEquityColumns;

    StoreManager.store.set('preferences', {
      ...preferences,
      enableMultipleEquityColumns: newValue,
    });

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.MULTIPLE_EQUITIES} ${newValue}`,
    });
  }

  public static createMenusForGodleyView(
    window: Electron.BrowserWindow,
    itemInfo: CanvasItem
  ) {
    const itemAccessor = `${commandsMapping.GET_NAMED_ITEM}/${itemInfo.id}/second`;

    const preferences = StoreManager.store.get('preferences');
    const {
      enableMultipleEquityColumns,
      godleyTableShowValues,
      godleyTableOutputStyle,
    } = preferences;
    const menu = Menu.buildFromTemplate([
      new MenuItem({
        label: 'File',
        submenu: [
          {
            label: 'Export as',
            submenu: [
              {
                label: 'CSV',
                click: async () => {
                  const command = `${itemAccessor}/table/exportToCSV`;

                  await CommandsManager.exportGodleyAs('csv', command);
                },
              },
              {
                label: 'LaTeX',
                click: async () => {
                  const command = `${itemAccessor}/table/exportToLaTeX`;

                  await CommandsManager.exportGodleyAs('tex', command);
                },
              },
            ],
          },
        ],
      }),
      new MenuItem({
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'CmdOrCtrl + z',
            click: async () => {
              const numberOfTimes = 1;
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/undo ${numberOfTimes}`,
              });
            },
          },
          {
            label: 'Redo',
            accelerator: 'CmdOrCtrl + y',
            click: async () => {
              const numberOfTimes = -1;
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/undo ${numberOfTimes}`,
              });
            },
          },
          {
            label: 'Title',
            click: () => {
              CommandsManager.editGodleyTitle(itemInfo.id);
            },
          },
          {
            label: 'Cut',
            role: 'cut',
            accelerator: 'CmdOrCtrl + x',
            click: async () => {
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/cut`,
              });
            },
          },
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl + c',
            click: async () => {
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/copy`,
              });
            },
          },
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl + v',
            click: async () => {
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/paste`,
              });
            },
          },
        ],
      }),
      new MenuItem({
        label: 'View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl + Plus',
            click: async () => {
              const [x, y] = window.getContentSize();

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.GET_NAMED_ITEM}/${
                  itemInfo.id
                }/second/popup/zoom [${x / 2},${y / 2},${ZOOM_IN_FACTOR}]`,
              });
            },
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl + Minus',
            click: async () => {
              const [x, y] = window.getContentSize();
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.GET_NAMED_ITEM}/${
                  itemInfo.id
                }/second/popup/zoom [${x / 2},${y / 2},${ZOOM_OUT_FACTOR}]`,
              });
            },
          },
          {
            label: 'Reset Zoom',
            click: async () => {
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/zoomFactor 1`,
              });
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/requestRedraw`,
              });
            },
          },
        ],
      }),
      new MenuItem({
        label: 'Options',
        submenu: [
          {
            label: 'Show Values',
            type: 'checkbox',
            checked: godleyTableShowValues,
            click: async () => {
              const preferences = StoreManager.store.get('preferences');

              const {
                godleyTableOutputStyle,
                godleyTableShowValues,
              } = preferences;
              const newGodleyTableShowValues = !godleyTableShowValues;

              StoreManager.store.set({
                preferences: {
                  ...preferences,
                  godleyTableShowValues: newGodleyTableShowValues,
                },
              });

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.SET_GODLEY_DISPLAY_VALUE} [${newGodleyTableShowValues},"${godleyTableOutputStyle}"]`,
              });
              // CAVEAT:: Check that redrawing menus doesn't lead to memory leak (it is required because of this issue: https://github.com/electron/electron/issues/5055)
              MenuManager.createMenusForGodleyView(window, itemInfo);
            },
          },
          {
            label: 'DR/CR Style',
            type: 'checkbox',
            checked: godleyTableOutputStyle === 'DRCR',
            click: async () => {
              const preferences = StoreManager.store.get('preferences');

              const {
                godleyTableOutputStyle,
                godleyTableShowValues,
              } = preferences;

              const newGodleyTableOutputStyle =
                godleyTableOutputStyle === GodleyTableOutputStyles.DRCR
                  ? GodleyTableOutputStyles.SIGN
                  : GodleyTableOutputStyles.DRCR;

              StoreManager.store.set('preferences', {
                ...preferences,
                godleyTableOutputStyle: newGodleyTableOutputStyle,
              });

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.SET_GODLEY_DISPLAY_VALUE} [${godleyTableShowValues},"${newGodleyTableOutputStyle}"]`,
              });
              // CAVEAT:: Check that redrawing menus doesn't lead to memory leak (it is required because of this issue: https://github.com/electron/electron/issues/5055)
              MenuManager.createMenusForGodleyView(window, itemInfo);
            },
          },
          {
            label: 'Toggle Multiple Equity Column',
            type: 'checkbox',
            checked: enableMultipleEquityColumns,
            id: GodleyPopupMenuItemIds.toggleMultipleEquities,
            click: async () => {
              this.toggleMultipleEquitiesColumn();
              await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/requestRedraw`,
              });
              // CAVEAT:: Check that redrawing menus doesn't lead to memory leak (it is required because of this issue: https://github.com/electron/electron/issues/5055)
              MenuManager.createMenusForGodleyView(window, itemInfo);
            },
          },
        ],
      }),
      new MenuItem({
        label: 'Help',
        submenu: [
          {
            label: 'Help',
            click: () => {
              const fileName = HelpFilesManager.getHelpFileForType(
                ClassType.GodleyIcon
              );

              const path = !Utility.isPackaged()
                ? `${join(
                    __dirname,
                    '../../../',
                    `minsky-docs/minsky/${fileName}`
                  )}`
                : `${join(
                    process.resourcesPath,
                    `minsky-docs/minsky/${fileName}`
                  )}`;

              WindowManager.createMenuPopUpAndLoadFile({
                title: `Help: ${ClassType.GodleyIcon}`,
                height: 800,
                width: 1000,
                modal: true,
                url: path,
              });
            },
          },
        ],
      }),
    ]);

    window.setMenu(menu);
    return menu;
  }


  private static buildSubmenuForOperations(operations: string[]) {
    const submenu: MenuItemConstructorOptions[] = [];

    for (const o of operations) {
      submenu.push(this.addOpMenu(o));
    }
    return submenu;
  }

  private static addOpMenu(operation: string) {
    return {
      label: operation,
      async click() {
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.ADD_OPERATION} "${operation}"`,
        });
      },
    };
  }
  static async buildMenuForInsertOperations() {
    const availableOperationsMapping = await CommandsManager.getAvailableOperationsMapping();
    let insertOperationsMenu: MenuItem[] = [];
    for (const key in availableOperationsMapping) {
      insertOperationsMenu = [
        ...insertOperationsMenu,
        new MenuItem({
          label: key,
          submenu: this.buildSubmenuForOperations(
            availableOperationsMapping[key]
          ),
        }),
      ];
    }

    const insertMenu = Menu.getApplicationMenu().getMenuItemById('insert');

    insertOperationsMenu.forEach((o) => {
      insertMenu.submenu.append(o);
    });
  }
}
