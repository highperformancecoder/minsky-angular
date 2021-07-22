import {
  CanvasItem,
  ClassType,
  commandsMapping,
  isEmptyObject,
} from '@minsky/shared';
import { Menu, MenuItem } from 'electron';
import { CommandsManager } from './commandsManager';
import { RestServiceManager } from './restServiceManager';
import { WindowManager } from './windowManager';

export class ContextMenuManager {
  private static x: number = null;
  private static y: number = null;

  public static async initContextMenu(x: number, y: number) {
    const mainWindow = WindowManager.getMainWindow();

    try {
      this.x = x;
      this.y = y;

      const wire = await CommandsManager.getWireAt(this.x, this.y);

      const isWirePresent = !isEmptyObject(wire);

      const isWireVisible = (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_WIRE_VISIBLE,
      })) as boolean;

      if (isWirePresent && isWireVisible) {
        ContextMenuManager.buildAndDisplayContextMenu(
          ContextMenuManager.wireContextMenu(),
          mainWindow
        );
        return;
      }

      const itemInfo = await CommandsManager.getItemInfo(this.x, this.y);

      if (itemInfo?.classType) {
        switch (itemInfo?.classType) {
          case ClassType.GodleyIcon:
            ContextMenuManager.buildAndDisplayContextMenu(
              await ContextMenuManager.rightMouseGodley(itemInfo),
              mainWindow
            );
            break;

          case ClassType.Group:
            ContextMenuManager.buildAndDisplayContextMenu(
              await ContextMenuManager.rightMouseGroup(itemInfo),
              mainWindow
            );
            break;

          default:
            ContextMenuManager.buildAndDisplayContextMenu(
              await ContextMenuManager.contextMenu(itemInfo),
              mainWindow
            );

            break;
        }

        return;
      }

      ContextMenuManager.buildAndDisplayContextMenu(
        ContextMenuManager.canvasContext(),
        mainWindow
      );

      return;
    } catch (error) {
      console.error(
        '🚀 ~ file: contextMenuManager.ts ~ line 117 ~ ContextMenuManager ~ mainWindow.webContents.on ~ error',
        error
      );
    }
  }

  private static async rightMouseGodley(
    itemInfo: CanvasItem
  ): Promise<MenuItem[]> {
    if (await CommandsManager.selectVar(this.x, this.y)) {
      const menuItems: MenuItem[] = [
        new MenuItem({
          label: 'Copy',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_COPY_ITEM,
            });
          },
        }),
        new MenuItem({
          label: 'Rename all instances',
          click: async () => {
            await CommandsManager.renameAllInstances(itemInfo);
          },
        }),
      ];

      return menuItems;
    } else {
      return await ContextMenuManager.contextMenu(itemInfo);
    }
  }

  private static async rightMouseGroup(
    itemInfo: CanvasItem
  ): Promise<MenuItem[]> {
    if (await CommandsManager.selectVar(this.x, this.y)) {
      const menuItems = [
        new MenuItem({
          label: 'Edit',
          click: async () => {
            await CommandsManager.editItem(itemInfo.classType);
          },
        }),
        new MenuItem({
          label: 'Copy',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_COPY_ITEM,
            });
          },
        }),
        new MenuItem({
          label: 'Remove',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_REMOVE_ITEM_FROM_ITS_GROUP,
            });
          },
        }),
      ];

      return menuItems;
    } else {
      return await ContextMenuManager.contextMenu(itemInfo);
    }
  }

  private static wireContextMenu(): MenuItem[] {
    const menuItems = [
      new MenuItem({
        label: 'Description',
        click: () => {
          CommandsManager.postNote('wire');
        },
      }),
      new MenuItem({
        label: 'Straighten',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_WIRE_STRAIGHTEN,
          });
        },
      }),
      new MenuItem({
        label: 'Delete wire',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_DELETE_WIRE,
          });
        },
      }),
    ];

    return menuItems;
  }

  private static canvasContext(): MenuItem[] {
    const menuItems = [
      new MenuItem({
        label: 'Cut',
        // click: async () => {
        //   await RestServiceManager.handleMinskyProcess({
        //     command: commandsMapping.CUT,
        //   });
        // },
      }),
      new MenuItem({
        label: 'Copy selection',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.COPY,
          });
        },
      }),
      new MenuItem({
        label: 'Save selection as',
        click: async () => {
          await CommandsManager.saveSelectionAsFile();
        },
      }),
      new MenuItem({
        label: 'Paste selection',
        click: () => {
          CommandsManager.pasteAt(this.x, this.y);
        },
      }),
      new MenuItem({
        label: 'Hide defining groups of selected variables',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_PUSH_DEFINING_VARS_TO_TAB,
          });
        },
      }),
      new MenuItem({
        label: 'Show all defining groups on canvas',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_SHOW_DEFINING_VARS_ON_CANVAS,
          });
        },
      }),
      new MenuItem({
        label: 'Show all plots on tab',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_SHOW_ALL_PLOTS_ON_TAB,
          });
        },
      }),
      new MenuItem({
        label: 'Bookmark here',
        click: async () => {
          await CommandsManager.bookmarkAt(this.x, this.y);
        },
      }),
      new MenuItem({
        label: 'Group',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.GROUP_SELECTION,
          });
        },
      }),
      new MenuItem({
        label: 'Lock selected Ravels',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_LOCK_RAVELS_IN_SELECTION,
          });
        },
      }),
      new MenuItem({
        label: 'Unlock selected Ravels',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_UNLOCK_RAVELS_IN_SELECTION,
          });
        },
      }),
      new MenuItem({
        label: 'Open master group',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_OPEN_MODEL_IN_CANVAS,
          });
        },
      }),
    ];

    return menuItems;
  }

  private static buildAndDisplayContextMenu(
    menuItems: MenuItem[],
    mainWindow: Electron.BrowserWindow
  ) {
    if (menuItems.length) {
      const menu = Menu.buildFromTemplate([
        new MenuItem({
          label: 'Help',
          click: async () => {
            await CommandsManager.help(this.x, this.y);
          },
        }),
        ...menuItems,
      ]);

      menu.popup({
        window: mainWindow,
        x: this.x,
        y: this.y + WindowManager.electronTopOffset,
      });
    }
  }

  private static async contextMenu(itemInfo: CanvasItem) {
    let menuItems: MenuItem[] = [
      new MenuItem({
        label: 'Description',
        click: () => {
          CommandsManager.postNote('item');
        },
      }),
    ];

    switch (itemInfo?.classType) {
      case ClassType.Variable:
      case ClassType.VarConstant:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForVariables(itemInfo)),
        ];
        break;

      case ClassType.Operation:
      case ClassType.IntOp:
      case ClassType.DataOp:
      case ClassType.UserFunction:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForOperations(itemInfo)),
        ];
        break;

      case ClassType.PlotWidget:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForPlotWidget()),
        ];
        break;

      case ClassType.GodleyIcon:
        menuItems = [
          ...menuItems,
          ...ContextMenuManager.buildContextMenuForGodleyIcon(),
        ];

        break;

      case ClassType.Group:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForGroup()),
        ];
        break;

      case ClassType.Item:
        menuItems = [
          ...menuItems,
          new MenuItem({
            label: 'Copy item',
            click: async () => {
              await RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_COPY_ITEM,
              });
            },
          }),
        ];

        break;

      case ClassType.SwitchIcon:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForSwitchIcon()),
        ];

        break;

      case ClassType.Ravel:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForRavel()),
        ];

        break;

      case ClassType.Lock:
        menuItems = [
          ...menuItems,
          ...(await ContextMenuManager.buildContextMenuForLock()),
        ];

        break;

      default:
        break;
    }

    menuItems = [
      ...menuItems,
      new MenuItem({
        label: `Delete ${itemInfo.classType}`,
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_DELETE_ITEM,
          });
        },
      }),
    ];

    return menuItems;
  }

  private static async buildContextMenuForPlotWidget(): Promise<MenuItem[]> {
    const menuItems = [
      new MenuItem({ label: 'Expand' }),
      new MenuItem({
        label: 'Make Group Plot',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_MAKE_DISPLAY_PLOT,
          });
        },
      }),
      new MenuItem({ label: 'Options' }),
      new MenuItem({
        label: 'Pen Styles',
        click: () => {
          WindowManager.createMenuPopUpWithRouting({
            title: `Pen Styles`,
            url: `#/headless/menu/context-menu/pen-styles`,
            height: 500,
            width: 350,
          });
        },
      }),
      new MenuItem({
        label: 'Display plot on tab',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_TOGGLE_PLOT_TAB_DISPLAY,
          });
        },
      }),
      new MenuItem({
        label: 'Export as CSV',
        click: async () => {
          await CommandsManager.exportItemAsCSV();
        },
      }),
      new MenuItem({
        label: 'Export as Image',
        click: async () => {
          await CommandsManager.exportItemAsImage();
        },
      }),
    ];

    return menuItems;
  }

  private static buildContextMenuForGodleyIcon(): MenuItem[] {
    const menuItems = [
      new MenuItem({ label: 'Open Godley Table' }),
      new MenuItem({
        label: 'Title',
        click: () => {
          CommandsManager.editGodleyTitle();
        },
      }),
      new MenuItem({
        label: 'Set currency',
        click: () => {
          CommandsManager.setGodleyCurrency();
        },
      }),
      new MenuItem({
        label: 'Editor mode',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_TOGGLE_EDITOR_MODE,
          });
        },
      }),
      new MenuItem({
        label: 'Row/Col buttons',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_TOGGLE_BUTTONS,
          });
        },
      }),
      new MenuItem({
        label: 'Display variables',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_TOGGLE_VARIABLE_DISPLAY,
          });
        },
      }),
      new MenuItem({
        label: 'Copy flow variables',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_COPY_ALL_FLOW_VARS,
          });
        },
      }),
      new MenuItem({
        label: 'Copy stock variables',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_COPY_ALL_STOCK_VARS,
          });
        },
      }),
      new MenuItem({
        label: 'Export as',
        submenu: [
          {
            label: 'CSV',
            click: async () => {
              await CommandsManager.exportGodleyAs('csv');
            },
          },
          {
            label: 'LaTeX',
            click: async () => {
              await CommandsManager.exportGodleyAs('tex');
            },
          },
        ],
      }),
    ];
    return menuItems;
  }

  private static async buildContextMenuForOperations(
    itemInfo: CanvasItem
  ): Promise<MenuItem[]> {
    let portValues = 'unknown';

    try {
      portValues = (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_PORT_VALUES,
      })) as string;
    } catch (error) {
      portValues = 'unknown';
    }

    let menuItems = [
      new MenuItem({ label: `Port values ${portValues}}` }),
      new MenuItem({
        label: 'Edit',
        click: async () => {
          await CommandsManager.editItem(itemInfo.classType);
        },
      }),
    ];

    if ((await CommandsManager.getItemType()) === 'data') {
      menuItems.push(
        new MenuItem({
          label: 'Import Data',
          click: async () => {
            const filePath = await CommandsManager.getFilePathUsingSaveDialog();

            if (filePath) {
              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.CANVAS_ITEM_READ_DATA} "${filePath}"`,
              });
            }
          },
        })
      );
    }

    menuItems = [
      ...menuItems,
      new MenuItem({
        label: 'Copy item',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_COPY_ITEM,
          });
        },
      }),
      new MenuItem({
        label: 'Flip',
        click: async () => {
          await CommandsManager.flip();
        },
      }),
    ];

    if ((await CommandsManager.getItemType()) === 'integrate') {
      menuItems.push(
        new MenuItem({
          label: 'Toggle var binding',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_TOGGLE_COUPLED,
            });
            CommandsManager.requestRedraw();
          },
        })
      );
      menuItems.push(
        new MenuItem({
          label: 'Select all instances',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_SELECT_ALL_VARIABLES,
            });
          },
        })
      );
      menuItems.push(
        new MenuItem({
          label: 'Rename all instances',
          click: async () => {
            await CommandsManager.renameAllInstances(itemInfo);
          },
        })
      );
    }
    return menuItems;
  }

  private static async buildContextMenuForGroup(): Promise<MenuItem[]> {
    const menuItems = [
      new MenuItem({
        label: 'Edit',
        click: async () => {
          await CommandsManager.editItem(ClassType.Group);
        },
      }),
      new MenuItem({
        label: 'Open in canvas',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_OPEN_GROUP_IN_CANVAS,
          });
        },
      }),
      new MenuItem({
        label: 'Zoom to display',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ZOOM_TO_DISPLAY,
          });
        },
      }),
      new MenuItem({
        label: 'Remove plot icon',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_REMOVE_DISPLAY_PLOT,
          });
        },
      }),
      new MenuItem({
        label: 'Copy',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_COPY_ITEM,
          });
        },
      }),
      new MenuItem({
        label: 'Save group as',
        click: async () => {
          await CommandsManager.saveGroupAsFile();
        },
      }),
      new MenuItem({
        label: 'Flip',
        click: async () => {
          await CommandsManager.flip();
        },
      }),
      new MenuItem({
        label: 'Flip Contents',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ITEM_FLIP_CONTENTS,
          });
          CommandsManager.requestRedraw();
        },
      }),
      new MenuItem({
        label: 'Ungroup',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_UNGROUP_ITEM,
          });
          CommandsManager.requestRedraw();
        },
      }),
    ];

    return menuItems;
  }

  private static async buildContextMenuForRavel(): Promise<MenuItem[]> {
    let menuItems = [
      new MenuItem({
        label: 'Export as CSV',
        click: async () => {
          await CommandsManager.exportItemAsCSV();
        },
      }),
    ];

    if ((await CommandsManager.getLockGroup()).length) {
      menuItems = [
        ...menuItems,
        new MenuItem({ label: 'Lock specific handles' }),
        new MenuItem({ label: 'Axis properties' }),
        new MenuItem({
          label: 'Unlock',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_ITEM_LEAVE_LOCK_GROUP,
            });

            CommandsManager.requestRedraw();
          },
        }),
      ];
    }

    return menuItems;
  }

  private static async buildContextMenuForSwitchIcon(): Promise<MenuItem[]> {
    const menuItems = [
      new MenuItem({
        label: 'Add case',
        click: async () => {
          await CommandsManager.incrCase(1);
        },
      }),
      new MenuItem({
        label: 'Delete case',
        click: async () => {
          await CommandsManager.incrCase(-1);
        },
      }),
      new MenuItem({
        label: 'Flip',
        click: async () => {
          await CommandsManager.flipSwitch();
        },
      }),
    ];

    return menuItems;
  }

  private static async buildContextMenuForLock(): Promise<MenuItem[]> {
    const menuItems = [];

    const isItemLocked = await CommandsManager.isItemLocked();

    const toggleLocked = async () => {
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_TOGGLE_LOCKED,
      });
    };

    if (isItemLocked) {
      menuItems.push(
        new MenuItem({
          label: 'Unlock',
          click: async () => {
            await toggleLocked();
          },
        })
      );
    } else {
      menuItems.push(
        new MenuItem({
          label: 'Lock',
          click: async () => {
            await toggleLocked();
          },
        })
      );
    }

    return menuItems;
  }

  private static async buildContextMenuForVariables(
    itemInfo: CanvasItem
  ): Promise<MenuItem[]> {
    let dims = null;

    if (
      itemInfo?.classType === ClassType.Variable ||
      itemInfo?.classType === ClassType.VarConstant
    ) {
      dims = await CommandsManager.getItemDims();
    }

    const menuItems = [
      dims && dims.length
        ? new MenuItem({ label: `Dims ${dims.toString()}` })
        : new MenuItem({ label: `Value ${itemInfo?.value || ''}` }),
      new MenuItem({
        label: 'Find definition',
        click: async () => {
          await CommandsManager.findDefinition();
        },
      }),
      new MenuItem({
        label: 'Select all instances',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_SELECT_ALL_VARIABLES,
          });
        },
      }),
      new MenuItem({
        label: 'Find all instances',
        click: async () => {
          await CommandsManager.findAllInstances();
        },
      }),
      new MenuItem({
        label: 'Rename all instances',
        click: async () => {
          await CommandsManager.renameAllInstances(itemInfo);
        },
      }),
      new MenuItem({
        label: 'Edit',
        click: async () => {
          await CommandsManager.editVar();
        },
      }),
      new MenuItem({
        label: 'Copy item',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_COPY_ITEM,
          });
        },
      }),
      new MenuItem({
        label: 'Add integral',
        click: async () => {
          await RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_ADD_INTEGRAL,
          });
        },
      }),
    ];

    if (await CommandsManager.isItemDefined()) {
      menuItems.push(
        new MenuItem({
          label: 'Display variable on tab',
          click: async () => {
            await RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_ITEM_TOGGLE_VAR_TAB_DISPLAY,
            });
          },
        })
      );
    }

    menuItems.push(
      new MenuItem({
        label: 'Flip',
        click: async () => {
          await CommandsManager.flip();
        },
      })
    );

    if ((await CommandsManager.getItemType()) === 'parameter') {
      menuItems.push(new MenuItem({ label: 'Import CSV' }));
    }

    menuItems.push(
      new MenuItem({
        label: 'Export as CSV',
        click: async () => {
          await CommandsManager.exportItemAsCSV();
        },
      })
    );

    return menuItems;
  }
}
