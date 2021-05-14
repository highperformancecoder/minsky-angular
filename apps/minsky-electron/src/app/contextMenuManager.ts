import {
  CanvasItem,
  ClassType,
  commandsMapping,
  isEmptyObject,
  toBoolean,
} from '@minsky/shared';
import { Menu, MenuItem } from 'electron';
import { CommandsManager } from './commandsManager';
import { RestServiceManager } from './restServiceManager';
import { WindowManager } from './windowManager';

export class ContextMenuManager {
  public static initContextMenu() {
    const mainWindow = WindowManager.getMainWindow();

    mainWindow.webContents.on('context-menu', async (event, params) => {
      const { x, y } = params;

      if (y < WindowManager.topOffset) {
        return;
      }

      const cairoTopOffset = y - WindowManager.topOffset;

      const wire = await CommandsManager.getWireAt(x, cairoTopOffset);

      const isWirePresent = !isEmptyObject(wire);

      const isWireVisible = toBoolean(
        await RestServiceManager.getCommandValue({
          command: commandsMapping.CANVAS_WIRE_VISIBLE,
        })
      );

      if (isWirePresent && isWireVisible) {
        ContextMenuManager.buildAndDisplayContextMenu(
          ContextMenuManager.wireContextMenu(),
          mainWindow,
          x,
          y
        );
        return;
      }

      const itemInfo = await CommandsManager.getItemInfo(x, cairoTopOffset);

      if (itemInfo?.classType) {
        switch (itemInfo?.classType) {
          case ClassType.GodleyIcon:
            ContextMenuManager.buildAndDisplayContextMenu(
              await ContextMenuManager.rightMouseGodley(
                x,
                cairoTopOffset,
                itemInfo
              ),
              mainWindow,
              x,
              y
            );
            break;

          case ClassType.Group:
            ContextMenuManager.buildAndDisplayContextMenu(
              await ContextMenuManager.rightMouseGroup(
                x,
                cairoTopOffset,
                itemInfo
              ),
              mainWindow,
              x,
              y
            );
            break;

          default:
            ContextMenuManager.buildAndDisplayContextMenu(
              ContextMenuManager.contextMenu(itemInfo),
              mainWindow,
              x,
              y
            );

            break;
        }

        return;
      }

      ContextMenuManager.buildAndDisplayContextMenu(
        ContextMenuManager.canvasContext(),
        mainWindow,
        x,
        y
      );

      return;
    });
  }

  private static async rightMouseGodley(
    x: number,
    y: number,
    itemInfo: CanvasItem
  ): Promise<MenuItem[]> {
    if (await CommandsManager.selectVar(x, y)) {
      const menuItems: MenuItem[] = [
        new MenuItem({
          label: 'Copy',
          click: () => {
            RestServiceManager.handleMinskyProcess({
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
      return ContextMenuManager.contextMenu(itemInfo);
    }
  }

  private static async rightMouseGroup(
    x: number,
    y: number,
    itemInfo: CanvasItem
  ): Promise<MenuItem[]> {
    if (await CommandsManager.selectVar(x, y)) {
      const menuItems = [
        new MenuItem({ label: 'Edit' }),
        new MenuItem({
          label: 'Copy',
          click: () => {
            RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_COPY_ITEM,
            });
          },
        }),
        new MenuItem({
          label: 'Remove',
          click: () => {
            RestServiceManager.handleMinskyProcess({
              command: commandsMapping.CANVAS_REMOVE_ITEM_FROM_ITS_GROUP,
            });
          },
        }),
      ];

      return menuItems;
    } else {
      return ContextMenuManager.contextMenu(itemInfo);
    }
  }

  private static wireContextMenu(): MenuItem[] {
    const menuItems = [
      new MenuItem({ label: 'Help' }),
      new MenuItem({ label: 'Description' }),
      new MenuItem({
        label: 'Straighten',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_WIRE_STRAIGHTEN,
          });
        },
      }),
      new MenuItem({ label: 'Browse object' }),
      new MenuItem({
        label: 'Delete wire',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_DELETE_WIRE,
          });
        },
      }),
    ];

    return menuItems;
  }

  private static canvasContext(): MenuItem[] {
    const menuItems = [
      new MenuItem({ label: 'Help' }),
      new MenuItem({
        label: 'Cut',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CUT,
          });
        },
      }),
      new MenuItem({
        label: 'Copy selection',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.COPY,
          });
        },
      }),
      new MenuItem({ label: 'Save selection as' }),
      new MenuItem({ label: 'Paste selection' }),
      new MenuItem({
        label: 'Hide defining groups of selected variables',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_PUSH_DEFINING_VARS_TO_TAB,
          });
        },
      }),
      new MenuItem({
        label: 'Show all defining groups on canvas',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_SHOW_DEFINING_VARS_ON_CANVAS,
          });
        },
      }),
      new MenuItem({
        label: 'Show all plots on tab',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_SHOW_ALL_PLOTS_ON_TAB,
          });
        },
      }),
      new MenuItem({ label: 'Bookmark here' }),
      new MenuItem({
        label: 'Group',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.ADD_GROUP,
          });
        },
      }),
      new MenuItem({
        label: 'Lock selected Ravels',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_LOCK_RAVELS_IN_SELECTION,
          });
        },
      }),
      new MenuItem({
        label: 'Unlock selected Ravels',
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_UNLOCK_RAVELS_IN_SELECTION,
          });
        },
      }),
      new MenuItem({ label: 'Open master group' }),
    ];

    return menuItems;
  }

  private static buildAndDisplayContextMenu(
    menuItems: MenuItem[],
    mainWindow: Electron.BrowserWindow,
    x: number,
    y: number
  ) {
    if (menuItems.length) {
      const menu = Menu.buildFromTemplate(menuItems);

      menu.popup({ window: mainWindow, x, y });
    }
  }

  private static contextMenu(itemInfo: CanvasItem) {
    let menuItems: MenuItem[] = [
      new MenuItem({ label: 'Help' }),
      new MenuItem({ label: 'Description' }),
    ];

    switch (itemInfo?.classType) {
      case ClassType.Variable:
      case ClassType.VarConstant:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: `Value ${itemInfo?.value || ''}` }),
          new MenuItem({ label: 'Dims' }),
          new MenuItem({ label: 'Find definition' }),
          new MenuItem({
            label: 'Select all instances',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_SELECT_ALL_VARIABLES,
              });
            },
          }),
          new MenuItem({ label: 'Find all instances' }),
          new MenuItem({
            label: 'Rename all instances',
            click: async () => {
              await CommandsManager.renameAllInstances(itemInfo);
            },
          }),
          new MenuItem({ label: 'Edit' }),
          new MenuItem({
            label: 'Copy item',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_COPY_ITEM,
              });
            },
          }),
          new MenuItem({ label: 'Add integral' }),
          new MenuItem({ label: 'Display variable on tab' }),
          new MenuItem({
            label: 'Flip',
            click: async () => {
              await CommandsManager.flip();
            },
          }),
          new MenuItem({ label: 'Import CSV' }),
          new MenuItem({ label: 'Display CSV values on tab' }),
          new MenuItem({ label: 'Export as CSV' }),
        ];
        break;

      case ClassType.Operation:
      case ClassType.IntOp:
      case ClassType.DataOp:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Port values' }),
          new MenuItem({ label: 'Edit' }),
          new MenuItem({ label: 'Import Data' }),
          new MenuItem({ label: 'Initialize Random' }),
          new MenuItem({
            label: 'Copy item',
            click: () => {
              RestServiceManager.handleMinskyProcess({
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
          new MenuItem({ label: 'Toggle var binding' }),
          new MenuItem({
            label: 'Select all instances',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_SELECT_ALL_VARIABLES,
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
        break;

      case ClassType.PlotWidget:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Expand' }),
          new MenuItem({ label: 'Make Group Plot' }),
          new MenuItem({ label: 'Options' }),
          new MenuItem({ label: 'Pen Styles' }),
          new MenuItem({ label: 'Display plot on tab' }),
          new MenuItem({ label: 'Export as CSV' }),
          new MenuItem({ label: 'Export as Image' }),
        ];
        break;

      case ClassType.GodleyIcon:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Open Godley Table' }),
          new MenuItem({ label: 'Title' }),
          new MenuItem({ label: 'Set currency' }),
          new MenuItem({ label: 'Editor mode' }),
          new MenuItem({ label: 'Row/Col buttons' }),
          new MenuItem({ label: 'Display variables' }),
          new MenuItem({
            label: 'Copy flow variables',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_COPY_ALL_FLOW_VARS,
              });
            },
          }),
          new MenuItem({
            label: 'Copy stock variables',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_COPY_ALL_STOCK_VARS,
              });
            },
          }),
          new MenuItem({ label: 'Export to file' }),
        ];

        break;

      case ClassType.Group:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Edit' }),
          new MenuItem({ label: 'Open in canvas' }),
          new MenuItem({
            label: 'Zoom to display',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_ZOOM_TO_DISPLAY,
              });
            },
          }),
          new MenuItem({ label: 'Remove plot icon' }),
          new MenuItem({
            label: 'Copy',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_COPY_ITEM,
              });
            },
          }),
          new MenuItem({ label: 'Save group as' }),
          new MenuItem({
            label: 'Flip',
            click: async () => {
              await CommandsManager.flip();
            },
          }),
          new MenuItem({ label: 'Flip Contents' }),
          new MenuItem({
            label: 'Ungroup',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_UNGROUP_ITEM,
              });
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_REQUEST_REDRAW,
              });
            },
          }),
        ];
        break;

      case ClassType.Item:
        menuItems = [
          ...menuItems,
          new MenuItem({
            label: 'Copy item',
            click: () => {
              RestServiceManager.handleMinskyProcess({
                command: commandsMapping.CANVAS_COPY_ITEM,
              });
            },
          }),
        ];

        break;

      case ClassType.SwitchIcon:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Add case' }),
          new MenuItem({ label: 'Delete case' }),
          new MenuItem({
            label: 'Flip',
            click: async () => {
              await CommandsManager.flip();
            },
          }),
        ];

        break;

      case ClassType.Ravel:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Export as CSV' }),
          new MenuItem({ label: 'Axis properties' }),
          new MenuItem({ label: 'Lock specific handles' }),
          new MenuItem({ label: 'Unlock' }),
        ];

        break;

      case ClassType.Lock:
        menuItems = [
          ...menuItems,
          new MenuItem({ label: 'Unlock' }),
          new MenuItem({ label: 'Lock' }),
        ];

        break;

      default:
        break;
    }

    menuItems = [
      ...menuItems,
      new MenuItem({ label: 'Browse Object' }),
      new MenuItem({
        label: `Delete ${itemInfo.classType}`,
        click: () => {
          RestServiceManager.handleMinskyProcess({
            command: commandsMapping.CANVAS_DELETE_ITEM,
          });
        },
      }),
    ];

    return menuItems;
  }
}
