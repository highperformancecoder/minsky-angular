import {
  CanvasItem,
  ClassType,
  commandsMapping,
  green,
  isEmptyObject,
} from '@minsky/shared';
import { dialog } from 'electron';
import { RestServiceManager } from './restServiceManager';
import { WindowManager } from './windowManager';

export class CommandsManager {
  static async getItemAt(
    x: number,
    y: number
  ): Promise<Record<string, unknown>> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
    });

    const item = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM,
    });

    return item as Record<string, unknown>;
  }

  private static async getItemClassType(
    x: number = null,
    y: number = null,
    reInvokeGetItemAt = false
  ): Promise<ClassType> {
    if (reInvokeGetItemAt) {
      if (!x && !y) {
        throw new Error('Please provide x and y when reInvokeGetItemAt=true');
      }
      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const classTypeRes = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_CLASS_TYPE,
    })) as string;

    const classType = classTypeRes.includes(':')
      ? classTypeRes.split(':')[0]
      : classTypeRes;

    if (!classType) {
      return;
    }

    return ClassType[classType];
  }

  private static async getItemValue(
    x: number = null,
    y: number = null,
    reInvokeGetItemAt = false
  ): Promise<number> {
    if (reInvokeGetItemAt) {
      if (!x && !y) {
        throw new Error('Please provide x and y when reInvokeGetItemAt=true');
      }
      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const value = Number(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_VALUE,
      })
    );

    return value;
  }

  private static async getItemName(
    x: number = null,
    y: number = null,
    reInvokeGetItemAt = false
  ): Promise<string> {
    if (reInvokeGetItemAt) {
      if (!x && !y) {
        throw new Error('Please provide x and y when reInvokeGetItemAt=true');
      }

      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const name = String(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_NAME,
      })
    );

    return name;
  }

  private static async getItemDescription(
    x: number = null,
    y: number = null,
    reInvokeGetItemAt = false
  ): Promise<string> {
    if (reInvokeGetItemAt) {
      if (!x && !y) {
        throw new Error('Please provide x and y when reInvokeGetItemAt=true');
      }

      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const description = String(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_DESCRIPTION,
      })
    );

    return description;
  }

  static async getItemInfo(x: number, y: number): Promise<CanvasItem> {
    const item = await this.getItemAt(x, y);

    if (isEmptyObject(item)) {
      return null;
    }

    const classType = await this.getItemClassType(x, y);

    const value = await this.getItemValue(x, y);

    const itemInfo: CanvasItem = { classType, value };

    console.log(green(JSON.stringify(itemInfo)));

    return itemInfo;
  }

  static async getWireAt(
    x: number,
    y: number
  ): Promise<Record<string, unknown>> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_WIRE_AT} [${x},${y}]`,
    });

    const wire = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_WIRE,
    });

    return wire as Record<string, unknown>;
  }

  static async addOperation(operation: string): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_OPERATION} "${operation}"`,
    });

    return;
  }

  static async addPlot(): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_PLOT}`,
    });

    return;
  }

  static async addGodley(): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_GODLEY}`,
    });

    return;
  }

  static async selectVar(x: number, y: number): Promise<boolean> {
    const selectVar = await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_SELECT_VAR} [${x},${y}]`,
    });

    return selectVar as boolean;
  }

  static async flipSwitch(): Promise<void> {
    const flipped = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_FLIPPED,
    })) as boolean;

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_ITEM_FLIPPED} ${!flipped}`,
    });

    return;
  }

  static async flip(): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_ITEM_FLIP}`,
    });

    const defaultRotation = Number(
      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_DEFAULT_ROTATION}`,
      })
    );

    const newRotation = (defaultRotation + 180) % 360;

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_DEFAULT_ROTATION} ${newRotation}`,
    });

    return;
  }

  static async exportItemAsImage(): Promise<void> {
    const exportImage = await dialog.showSaveDialog({
      title: 'Export item as...',
      defaultPath: 'export.svg',
      properties: ['showOverwriteConfirmation', 'createDirectory'],
      filters: [
        { extensions: ['svg'], name: 'SVG' },
        { extensions: ['pdf'], name: 'PDF' },
        { extensions: ['ps'], name: 'PostScript' },
        { extensions: ['emf'], name: 'LaTeX' },
      ],
    });

    const { canceled, filePath } = exportImage;
    if (canceled || !filePath) {
      return;
    }

    const extension = filePath.split('.').pop();

    switch (extension?.toLowerCase()) {
      case 'svg':
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.CANVAS_ITEM_RENDER_TO_SVG} "${filePath}"`,
        });
        break;

      case 'pdf':
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.CANVAS_ITEM_RENDER_TO_PDF} "${filePath}"`,
        });
        break;

      case 'ps':
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.CANVAS_ITEM_RENDER_TO_PS} "${filePath}"`,
        });
        break;

      case 'emf':
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.CANVAS_ITEM_RENDER_TO_EMF} "${filePath}"`,
        });
        break;

      default:
        break;
    }
  }

  static async exportItemAsCSV(): Promise<void> {
    const exportItemDialog = await dialog.showSaveDialog({
      title: 'Export item as csv',
      defaultPath: 'item.csv',
      properties: ['showOverwriteConfirmation', 'createDirectory'],
      filters: [
        { extensions: ['csv'], name: 'CSV' },
        { extensions: ['*'], name: 'ALL' },
      ],
    });

    const { canceled, filePath } = exportItemDialog;

    if (canceled || !filePath) {
      return;
    }

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_EXPORT_AS_CSV} "${filePath}"`,
    });

    return;
  }

  static async renameAllInstances(itemInfo: CanvasItem): Promise<void> {
    switch (itemInfo.classType) {
      case ClassType.Variable:
      case ClassType.VarConstant:
        CommandsManager.openRenameInstancesDialog(await this.getItemName());
        break;

      case ClassType.Operation:
      case ClassType.IntOp:
      case ClassType.DataOp:
        CommandsManager.openRenameInstancesDialog(
          await this.getItemDescription()
        );
        break;

      case ClassType.GodleyIcon:
        CommandsManager.openRenameInstancesDialog(await this.getItemName());
        break;

      default:
        break;
    }
  }

  private static openRenameInstancesDialog(name: string) {
    WindowManager.createMenuPopUpWithRouting({
      title: `Rename ${name}`,
      url: `#/headless/rename-all-instances?name=${name?.slice(1, 1) || ''}`,
      height: 100,
      width: 400,
    });
  }

  static async editGodleyTitle(): Promise<void> {
    const title = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_TABLE_TITLE,
    })) as string;

    WindowManager.createMenuPopUpWithRouting({
      title: `Edit godley title`,
      url: `#/headless/edit-godley-title?title=${title?.slice(1, 1) || ''}`,
      height: 100,
      width: 400,
    });
  }

  static async setGodleyCurrency(): Promise<void> {
    WindowManager.createMenuPopUpWithRouting({
      title: `Edit godley currency`,
      url: `#/headless/edit-godley-currency`,
      height: 100,
      width: 400,
    });
  }

  static async postNote(type: string) {
    const tooltip =
      ((await RestServiceManager.handleMinskyProcess({
        command: `/minsky/canvas/${type}/tooltip`,
      })) as string) || '';

    const detailedText =
      ((await RestServiceManager.handleMinskyProcess({
        command: `/minsky/canvas/${type}/detailedText`,
      })) as string) || '';

    WindowManager.createMenuPopUpWithRouting({
      title: `Description`,
      url: `#/headless/edit-description?type=${type}&tooltip=${tooltip}&detailedText=${detailedText}`,
    });
  }

  static async getItemDims(
    x: number = null,
    y: number = null,
    reInvokeGetItemAt = false
  ): Promise<number[]> {
    try {
      if (reInvokeGetItemAt) {
        if (!x && !y) {
          throw new Error('Please provide x and y when reInvokeGetItemAt=true');
        }
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
        });
      }

      const dimsRes = (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_DIMS,
      })) as Array<number>;

      return dimsRes;
    } catch (error) {
      console.error(
        '🚀 ~ file: commandsManager.ts ~ line 361 ~ CommandsManager ~ error',
        error
      );
      return null;
    }
  }

  static async isItemLocked(
    x: number = null,
    y: number = null,
    reInvokeGetItemAt = false
  ): Promise<boolean> {
    try {
      if (reInvokeGetItemAt) {
        if (!x && !y) {
          throw new Error('Please provide x and y when reInvokeGetItemAt=true');
        }
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
        });
      }

      const isLocked = await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_DIMS,
      });

      return isLocked as boolean;
    } catch (error) {
      console.error(
        '🚀 ~ file: commandsManager.ts ~ line 361 ~ CommandsManager ~ error',
        error
      );
      return null;
    }
  }

  static async incrCase(delta: number): Promise<void> {
    const numCases = Number(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_NUM_CASES,
      })
    );

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_ITEM_SET_NUM_CASES} ${
        numCases + delta
      }`,
    });

    CommandsManager.requestRedraw();

    return;
  }

  static async getLockGroup(): Promise<unknown[]> {
    const lockGroup = JSON.parse(
      (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_LOCK_GROUP,
      })) as string
    );

    return lockGroup;
  }

  static bookmarkThisPosition(): void {
    WindowManager.createMenuPopUpWithRouting({
      width: 420,
      height: 250,
      title: 'Bookmarks',
      url: `#/headless/menu/bookmarks/add-bookmark`,
    });

    return;
  }

  static async getModelX(): Promise<number> {
    const x = Number(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.X,
      })
    );

    return x;
  }

  static async getModelY(): Promise<number> {
    const y = Number(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.Y,
      })
    );

    return y;
  }

  static async bookmarkAt(x: number, y: number): Promise<void> {
    //  centre x,y in the visible canvas

    const modelX = await this.getModelX();
    const modelY = await this.getModelY();

    const delX = 0.5 * WindowManager.canvasWidth - x + modelX;
    const delY = 0.5 * WindowManager.canvasHeight - y + modelY;

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.MOVE_TO} [${delX},${delY}]`,
    });

    this.bookmarkThisPosition();
    return;
  }

  static async pasteAt(x: number, y: number): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.PASTE}`,
    });

    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.mousemove,
      mouseX: x,
      mouseY: y,
    });

    return;
  }

  static async saveSelectionAsFile(): Promise<void> {
    const saveDialog = await dialog.showSaveDialog({});

    if (saveDialog.canceled || !saveDialog.filePath) {
      return;
    }

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.SAVE_SELECTION_AS_FILE} "${saveDialog.filePath}"`,
    });

    return;
  }

  static async findDefinition(): Promise<void> {
    const findVariableDefinition = (await RestServiceManager.handleMinskyProcess(
      {
        command: commandsMapping.CANVAS_FIND_VARIABLE_DEFINITION,
      }
    )) as boolean;

    if (findVariableDefinition) {
      const itemX = (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.X,
      })) as number;

      const itemY = (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.Y,
      })) as number;

      const { canvasHeight, canvasWidth } = WindowManager;

      if (
        Math.abs(itemX - 0.5 * canvasWidth) > 0.5 * canvasWidth ||
        Math.abs(itemY - 0.5 * canvasHeight) > 0.5 * canvasHeight
      ) {
        const posX = itemX - itemX + 0.5 * canvasWidth;
        const posY = itemY - itemY + 0.5 * canvasHeight;

        await RestServiceManager.handleMinskyProcess({
          command: commandsMapping.MOVE_TO,
          mouseX: posX,
          mouseY: posY,
        });
      }

      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_ITEM_INDICATOR} 1`,
      });
    } else {
      dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
        type: 'info',
        message: 'Definition not found',
      });
    }

    return;
  }

  static async isItemDefined(): Promise<boolean> {
    const isItemDefined = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_DEFINED,
    });

    return isItemDefined as boolean;
  }

  static async getItemType(): Promise<string> {
    const type = ((await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_TYPE,
    })) as string)
      .slice(1, -1)
      .trim();

    return type;
  }

  static async getVarTabDisplay(): Promise<boolean> {
    const varTabDisplay = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_VAR_TAB_DISPLAY,
    });

    return varTabDisplay as boolean;
  }

  static async getFilePathUsingSaveDialog(): Promise<string> {
    const saveDialog = await dialog.showSaveDialog({});

    if (saveDialog.canceled || !saveDialog.filePath) {
      return null;
    }

    return saveDialog.filePath;
  }

  static async getFilePathFromExportCanvasDialog(
    type: string
  ): Promise<string> {
    const exportCanvasDialog = await dialog.showSaveDialog({
      title: 'Export canvas',
      defaultPath: `canvas.${type}`,
      properties: ['showOverwriteConfirmation', 'createDirectory'],
    });

    const { canceled, filePath } = exportCanvasDialog;
    if (canceled || !filePath) {
      return;
    }

    return filePath;
  }

  static async mouseDown(mouseX: number, mouseY: number): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.mousedown,
      mouseX,
      mouseY,
    });

    return;
  }

  static async mouseUp(mouseX: number, mouseY: number): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.mouseup,
      mouseX,
      mouseY,
    });

    return;
  }

  static async mouseMove(mouseX: number, mouseY: number): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.mousemove,
      mouseX,
      mouseY,
    });

    return;
  }

  static async requestRedraw(): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_REQUEST_REDRAW,
    });

    return;
  }

  static async createNewSystem() {
    const isCanvasEdited = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.EDITED,
    });

    if (isCanvasEdited) {
      const saveModelDialog = await dialog.showSaveDialog({
        title: 'Save Model?',
        properties: ['showOverwriteConfirmation', 'createDirectory'],
      });

      const { canceled, filePath } = saveModelDialog;
      if (canceled || !filePath) {
        return;
      }

      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.SAVE} "${filePath}"`,
      });
    }

    WindowManager.activeWindows.forEach((window) => {
      if (!window.isMainWindow) {
        window.context.close();
      }
    });

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

    for (const command of newSystemCommands) {
      await RestServiceManager.handleMinskyProcess({ command });
    }
    return;
  }

  static async getAvailableOperationsMapping(): Promise<
    Record<string, string[]>
  > {
    const availableOperations = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.AVAILABLE_OPERATIONS,
      render: false,
    })) as string[];

    const mapping = {
      'Fundamental Constants': [],
      'Binary Ops': [],
      Functions: [],
      Reductions: [],
      Scans: [],
      'Tensor operations': [],
    };
    for (const operation of availableOperations) {
      if (operation === 'numOps') {
        break;
      }
      switch (operation) {
        case 'constant':
        case 'copy':
        case 'ravel':
        case 'integrate':
        case 'differentiate':
        case 'time':
        case 'data':
          continue;
        default:
          break;
      }
      const command = `${commandsMapping.CLASSIFY_OPERATION} "${operation}"`;

      const type = (await RestServiceManager.handleMinskyProcess({
        command,
        render: false,
      })) as string;

      switch (type) {
        case 'function':
          mapping.Functions = [...mapping.Functions, operation];
          break;
        case 'constop':
          mapping['Fundamental Constants'] = [
            ...mapping['Fundamental Constants'],
            operation,
          ];
          break;
        case 'binop':
          mapping['Binary Ops'] = [...mapping['Binary Ops'], operation];
          break;
        case 'reduction':
          mapping.Reductions = [...mapping.Reductions, operation];
          break;
        case 'scan':
          mapping.Scans = [...mapping.Scans, operation];
          break;
        case 'tensor':
          mapping['Tensor operations'] = [
            ...mapping['Tensor operations'],
            operation,
          ];
          break;
        default:
          break;
      }
    }

    RestServiceManager.availableOperationsMappings = mapping;
    return mapping;
  }

  static async saveGroupAsFile(): Promise<void> {
    const defaultExtension = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.DEFAULT_EXTENSION,
    })) as string;

    const saveDialog = await dialog.showSaveDialog({
      filters: [
        {
          name: defaultExtension,
          extensions: [defaultExtension.slice(1)],
        },
        { name: 'All', extensions: ['*'] },
      ],
      defaultPath: `group${defaultExtension}`,
      properties: ['showOverwriteConfirmation'],
    });

    if (saveDialog.canceled || !saveDialog.filePath) {
      return;
    }

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.SAVE_CANVAS_ITEM_AS_FILE} "${saveDialog.filePath}"`,
    });

    return;
  }

  static async exportGodleyAs(ext: string): Promise<void> {
    const saveDialog = await dialog.showSaveDialog({
      filters: [
        {
          name: '.' + ext,
          extensions: [ext],
        },
        { name: 'All', extensions: ['*'] },
      ],
      defaultPath: `godley.${ext}`,
      properties: ['showOverwriteConfirmation'],
    });

    if (saveDialog.canceled || !saveDialog.filePath) {
      return;
    }

    switch (ext) {
      case 'csv':
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.EXPORT_GODLEY_TO_CSV} "${saveDialog.filePath}"`,
        });
        break;

      case 'tex':
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.EXPORT_GODLEY_TO_LATEX} "${saveDialog.filePath}"`,
        });
        break;

      default:
        break;
    }

    return;
  }
}
