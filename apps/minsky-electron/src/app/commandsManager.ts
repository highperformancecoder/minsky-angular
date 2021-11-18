import {
  CanvasItem,
  ClassType,
  commandsMapping,
  events,
  GodleyTableOutputStyles,
  green,
  isEmptyObject,
  normalizeFilePathForPlatform,
} from '@minsky/shared';
import { dialog, ipcMain, Menu, MenuItem } from 'electron';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { HelpFilesManager } from './HelpFilesManager';
import { RestServiceManager } from './restServiceManager';
import { StoreManager } from './storeManager';
import { Utility } from './utility';
import { WindowManager } from './windowManager';

const GodleyPopupMenuItemIds = {
  toggleMultipleEquities: 'multiple-equity-column-toggler',
};

export class CommandsManager {
  static activeGodleyWindowItems = new Map<number, CanvasItem>();

  static async getItemAt(
    x: number,
    y: number
  ): Promise<Record<string, unknown>> {
    await this.populateItemPointer(x, y);
    const item = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM,
    });
    return item as Record<string, unknown>;
  }

  static async deleteCurrentItemHavingId(itemId: number) {
    // TODO:: Ideally -- change flow to get the current item here..
    // to ensure that we cannot mismatch itemId and currentItemId
    if (itemId) {
      WindowManager.closeWindowByUid(itemId);
      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.REMOVE_ENTRY_FROM_NAMED_ITEMS_MAP} "${itemId}"`,
      });
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_DELETE_ITEM,
      });
    }
  }

  private static async populateItemPointer(x: number, y: number) {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
    });
  }

  private static async getItemClassType(
    x: number,
    y: number,
    raw = false
  ): Promise<ClassType | string> {
    await this.populateItemPointer(x, y);
    return this.getCurrentItemClassType(raw);
  }

  private static async getItemValue(x: number, y: number): Promise<number> {
    await this.populateItemPointer(x, y);
    return this.getCurrentItemValue();
  }

  private static async getItemName(x: number, y: number): Promise<string> {
    await this.populateItemPointer(x, y);
    return this.getCurrentItemName();
  }

  private static async getItemDescription(
    x: number,
    y: number
  ): Promise<string> {
    await this.populateItemPointer(x, y);
    return this.getCurrentItemDescription();
  }

  private static async getItemId(x: number, y: number): Promise<number> {
    await this.populateItemPointer(x, y);
    return this.getCurrentItemId();
  }

  private static async getCurrentItemClassType(
    raw = false
  ): Promise<ClassType | string> {
    const classTypeRes = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_CLASS_TYPE,
    })) as string;

    if (raw && classTypeRes) {
      return classTypeRes;
    }

    const classType = classTypeRes.includes(':')
      ? classTypeRes.split(':')[0]
      : classTypeRes;

    if (!classType) {
      return;
    }
    return ClassType[classType];
  }

  private static async getCurrentItemValue(): Promise<number> {
    const value = Number(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_VALUE,
      })
    );
    return value;
  }

  private static async getCurrentItemName(): Promise<string> {
    const name = String(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_NAME,
      })
    );
    return name;
  }

  private static async getCurrentItemDescription(): Promise<string> {
    const description = String(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_DESCRIPTION,
      })
    );
    return description;
  }

  public static async getCurrentItemId(): Promise<number> {
    const idResponse = Number(
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_ITEM_ID,
      })
    );
    return idResponse;
  }

  static async getItemInfo(x: number, y: number): Promise<CanvasItem> {
    const item = await this.getItemAt(x, y);

    if (isEmptyObject(item)) {
      return null;
    }

    const classType = (await this.getCurrentItemClassType()) as ClassType;
    const value = await this.getCurrentItemValue();
    const id = await this.getCurrentItemId();

    const itemInfo: CanvasItem = { classType, value, id };
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

  static async exportItemAsImage(
    extension: string,
    name: string
  ): Promise<void> {
    const exportImage = await dialog.showSaveDialog({
      title: 'Export item as...',
      defaultPath: `export.${extension}`,
      properties: ['showOverwriteConfirmation', 'createDirectory'],
      filters: [{ extensions: [extension], name }],
    });

    const { canceled, filePath } = exportImage;
    if (canceled || !filePath) {
      return;
    }

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
        CommandsManager.openRenameInstancesDialog(
          await this.getCurrentItemName()
        );
        break;

      case ClassType.Operation:
      case ClassType.IntOp:
      case ClassType.DataOp:
        CommandsManager.openRenameInstancesDialog(
          await this.getCurrentItemDescription()
        );
        break;

      case ClassType.GodleyIcon:
        CommandsManager.openRenameInstancesDialog(
          await this.getCurrentItemName()
        );
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

  static async editGodleyTitle(itemId: number = null): Promise<void> {
    let title = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_ITEM_TABLE_TITLE,
    })) as string;

    if (isEmptyObject(title)) {
      title = '';
    }

    WindowManager.createMenuPopUpWithRouting({
      title: `Edit godley title`,
      url: `#/headless/edit-godley-title?title=${title || ''}&itemId=${itemId}`,
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
      command: commandsMapping.MOUSEMOVE_SUBCOMMAND,
      mouseX: x,
      mouseY: y,
    });

    return;
  }

  static async saveSelectionAsFile(): Promise<void> {
    const saveDialog = await dialog.showSaveDialog({
      defaultPath: 'selection.mky',
    });

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
    })) as string).trim();

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
      command: commandsMapping.MOUSEDOWN_SUBCOMMAND,
      mouseX,
      mouseY,
    });

    return;
  }

  static async mouseUp(mouseX: number, mouseY: number): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.MOUSEUP_SUBCOMMAND,
      mouseX,
      mouseY,
    });

    return;
  }

  static async mouseMove(mouseX: number, mouseY: number): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.MOUSEMOVE_SUBCOMMAND,
      mouseX,
      mouseY,
    });

    return;
  }

  static async requestRedraw(): Promise<void> {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
    });
    return;
  }

  static async createNewSystem() {
    const isCanvasEdited = await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.EDITED,
    });

    if (isCanvasEdited) {
      const choice = dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
        type: 'question',
        buttons: ['Yes', 'No', 'Cancel'],
        title: 'Confirm',
        message: 'Save?',
      });

      if (choice === 0) {
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

      if (choice === 2) {
        return;
      }
    }

    WindowManager.activeWindows.forEach((window) => {
      if (!window.isMainWindow) {
        window.context.close();
      }
    });

    WindowManager.getMainWindow().setTitle('New System');

    const newSystemCommands = [
      `${commandsMapping.PUSH_HISTORY} false`,
      commandsMapping.CLEAR_ALL_MAPS,
      commandsMapping.PUSH_FLAGS,
      commandsMapping.CLEAR_HISTORY,
      `${commandsMapping.SET_ZOOM} 1`,
      commandsMapping.RECENTER,
      commandsMapping.POP_FLAGS,
      `${commandsMapping.PUSH_HISTORY} true`,
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

  static async exportGodleyAs(
    ext: string,
    command: string = null
  ): Promise<void> {
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

    if (command) {
      await RestServiceManager.handleMinskyProcess({
        command: `${command} "${saveDialog.filePath}"`,
      });
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

  static async openNamedFile(filePath: string) {
    filePath = normalizeFilePathForPlatform(filePath);
    const autoBackupFileName = filePath + '#';

    await this.createNewSystem();

    WindowManager.scrollToCenter();

    const autoBackupFileExists = existsSync(`${autoBackupFileName}`);

    if (!autoBackupFileExists) {
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.LOAD,
        filePath: filePath,
      });

      ipcMain.emit(events.ADD_RECENT_FILE, null, filePath);
    }

    if (autoBackupFileExists) {
      const choice = dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Auto save file exists, do you wish to load it?',
      });

      if (choice === 0) {
        await RestServiceManager.handleMinskyProcess({
          command: commandsMapping.LOAD,
          filePath: autoBackupFileName,
        });
      } else {
        await RestServiceManager.handleMinskyProcess({
          command: commandsMapping.LOAD,
          filePath: filePath,
        });

        ipcMain.emit(events.ADD_RECENT_FILE, null, filePath);

        unlinkSync(autoBackupFileName);
      }
    }

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.SET_AUTO_SAVE_FILE} "${autoBackupFileName}"`,
    });

    RestServiceManager.currentMinskyModelFilePath = filePath;

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.PUSH_HISTORY} 0`,
    });

    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.PUSH_FLAGS,
    });

    // TODO:
    // # minsky.load resets minsky.multipleEquities, so restore it to preferences
    // minsky.multipleEquities $preferences(multipleEquities)
    // canvas.focusFollowsMouse $preferences(focusFollowsMouse)
    // pushFlags

    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.RECENTER,
    });

    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
    });

    WindowManager.getMainWindow().setTitle(filePath);
  }

  static async help(x: number, y: number) {
    let classType = (await this.getCurrentItemClassType(true)) as string;

    if (isEmptyObject(classType)) {
      const wire = await CommandsManager.getWireAt(x, y);

      const isWirePresent = !isEmptyObject(wire);

      classType = isWirePresent ? 'Wires' : 'DesignCanvas';
    }

    if (!classType) {
      return;
    }

    // TODO: come up with a better solution
    switch (classType) {
      case ClassType.VarConstant:
        classType = 'Variable:constant';
        break;
      case ClassType.Sheet:
        classType = 'Sheets';
        break;

      default:
        break;
    }

    const fileName = HelpFilesManager.getHelpFileForType(classType);

    const path = !Utility.isPackaged()
      ? `${join(__dirname, '../../../', `minsky-docs/minsky/${fileName}`)}`
      : `${join(process.resourcesPath, `minsky-docs/minsky/${fileName}`)}`;

    WindowManager.createMenuPopUpAndLoadFile({
      title: `Help: ${classType}`,
      height: 800,
      width: 1000,
      modal: true,
      url: path,
    });

    return;
  }

  static async findAllInstances() {
    await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.LIST_ALL_INSTANCES,
    });

    const instances = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.VARIABLE_INSTANCE_LIST_NAMES,
    })) as string[];

    if (!instances.length) {
      return;
    }

    WindowManager.createMenuPopUpWithRouting({
      title: `Instances`,
      height: 500,
      width: 300,
      modal: true,
      url: `#/headless/find-all-instances`,
    });
  }

  static async editVar() {
    const itemName = await this.getCurrentItemName();
    const itemType = await this.getItemType();
    console.log(
      '🚀 ~ file: commandsManager.ts ~ line 1072 ~ CommandsManager ~ editVar ~ itemType',
      itemType
    );

    WindowManager.createMenuPopUpWithRouting({
      width: 500,
      height: 650,
      title: `Edit ${itemName || ''}`,
      url: `#/headless/menu/insert/create-variable?type=${itemType}&name=${
        itemName || ''
      }&isEditMode=true`,
    });
  }

  static async editItem(classType: string) {
    let height;
    switch (classType) {
      case ClassType.Group:
        height = 240;
        break;
      case ClassType.Operation:
        height = 330;
        break;
      case ClassType.UserFunction:
        height = 370;
        break;

      default:
        height = 410;
        break;
    }
    WindowManager.createMenuPopUpWithRouting({
      width: 500,
      height,
      title: `Edit ${classType || ''}`,
      url: `#/headless/edit-${classType.toLowerCase()}`,
    });
  }

  private static onPopupWindowClose(uid: number) {
    if (uid in this.activeGodleyWindowItems) {
      this.activeGodleyWindowItems.delete(uid);
    }
  }

  private static async initializePopupWindow(
    itemInfo: CanvasItem,
    url: string,
    height = 600,
    width = 800
  ): Promise<Electron.BrowserWindow> {
    // Pushing the current item to namedItems map
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_ENTRY_TO_NAMED_ITEMS_MAP} "${itemInfo.id}"`,
    });

    const window = WindowManager.createMenuPopUpWithRouting(
      {
        title: itemInfo.classType + ' : ' + itemInfo.id,
        url: url,
        uid: itemInfo.id,
        height,
        width,
      },
      () => {
        this.onPopupWindowClose(itemInfo.id);
      }
    );
    return window;
  }

  static async handleDoubleClick({ mouseX, mouseY }) {
    const itemInfo = await CommandsManager.getItemInfo(mouseX, mouseY);
    // TODO:: When opening a new popup for plot / godley or closing it,
    // notify the backend

    if (itemInfo?.classType) {
      switch (itemInfo?.classType) {
        case ClassType.GodleyIcon:
          if (!WindowManager.focusIfWindowIsPresent(itemInfo.id as number)) {
            let systemWindowId = null;
            const window = await this.initializePopupWindow(
              itemInfo,
              `#/headless/godley-widget-view?systemWindowId=${systemWindowId}&itemId=${itemInfo.id}`
            );

            systemWindowId = WindowManager.getWindowByUid(itemInfo.id)
              .systemWindowId;

            window.loadURL(
              WindowManager.getWindowUrl(
                `#/headless/godley-widget-view?systemWindowId=${systemWindowId}&itemId=${itemInfo.id}`
              )
            );

            CommandsManager.createMenusForGodleyView(window, itemInfo);

            this.activeGodleyWindowItems.set(itemInfo.id, itemInfo);
          }
          break;

        case ClassType.PlotWidget:
          if (!WindowManager.focusIfWindowIsPresent(itemInfo.id as number)) {
            let systemWindowId = null;
            const window = await this.initializePopupWindow(
              itemInfo,
              `#/headless/plot-widget-view?systemWindowId=${systemWindowId}&itemId=${itemInfo.id}`
            );

            systemWindowId = WindowManager.getWindowByUid(itemInfo.id)
              .systemWindowId;

            window.loadURL(
              WindowManager.getWindowUrl(
                `#/headless/plot-widget-view?systemWindowId=${systemWindowId}&itemId=${itemInfo.id}`
              )
            );

            // window.setMenu(
            //   Menu.buildFromTemplate([
            //     new MenuItem({
            //       label: 'Options',
            //       submenu: [
            //         {
            //           label: 'Options',
            //           click: () => {
            //             WindowManager.createMenuPopUpWithRouting({
            //               title: 'Plot Window Options',
            //               url: `#/headless/plot-widget-options?itemId=${itemInfo.id}`,
            //               uid: itemInfo.id,
            //               height: 500,
            //               width: 500,
            //             });
            //           },
            //         },
            //       ],
            //     }),
            //   ])
            // );
          }
          break;

        case ClassType.Variable:
        case ClassType.VarConstant:
          await CommandsManager.editVar();
          break;

        case ClassType.Operation:
          await CommandsManager.editItem(ClassType.Operation);

          break;

        case ClassType.IntOp:
        case ClassType.DataOp:
          await CommandsManager.editItem(ClassType.IntOp);

          break;

        case ClassType.UserFunction:
          await CommandsManager.editItem(ClassType.UserFunction);

          break;

        case ClassType.Group:
          await CommandsManager.editItem(ClassType.Group);
          break;

        case ClassType.Item:
          await CommandsManager.postNote('item');
          break;

        default:
          break;
      }
    }
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

  private static createMenusForGodleyView(
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
              const zoomFactor = (await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/zoomFactor`,
              })) as number;

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.GET_NAMED_ITEM}/${
                  itemInfo.id
                }/second/popup/zoomFactor ${zoomFactor * 1.1}`,
              });
            },
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl + Minus',
            click: async () => {
              const zoomFactor = (await RestServiceManager.handleMinskyProcess({
                command: `${itemAccessor}/popup/zoomFactor`,
              })) as number;

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.GET_NAMED_ITEM}/${
                  itemInfo.id
                }/second/popup/zoomFactor ${zoomFactor / 1.1}`,
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

              StoreManager.store.set({
                preferences: {
                  ...preferences,
                  godleyTableShowValues: !godleyTableShowValues,
                },
              });

              await RestServiceManager.handleMinskyProcess({
                command: `${commandsMapping.SET_GODLEY_DISPLAY_VALUE} [${godleyTableShowValues},"${godleyTableOutputStyle}"}]`,
              });
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
                command: `${commandsMapping.SET_GODLEY_DISPLAY_VALUE} [${godleyTableShowValues},"${newGodleyTableOutputStyle}"}]`,
              });
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

  static async logSimulation(selectedItems: string[]) {
    if (!Array.isArray(selectedItems) || !selectedItems.length) {
      return;
    }

    const logSimulation = await dialog.showSaveDialog({
      title: 'Save As',
      defaultPath: 'log_simulation.csv',
      properties: ['showOverwriteConfirmation', 'createDirectory'],
      filters: [{ extensions: ['csv'], name: 'CSV' }],
    });

    const { canceled, filePath } = logSimulation;
    if (canceled || !filePath) {
      return;
    }

    const logVarList = (await RestServiceManager.handleMinskyProcess({
      command: commandsMapping.LOG_VAR_LIST,
    })) as string[];

    if (logVarList && logVarList.length) {
      const itemsNotInSelectedItems = logVarList.filter(
        (l) => !selectedItems.includes(l)
      );

      for (const i of itemsNotInSelectedItems) {
        await RestServiceManager.handleMinskyProcess({
          command: `${commandsMapping.LOG_VAR_LIST_ERASE} "${i}"`,
        });
      }
    }

    const itemsNotInLogVarList = selectedItems.filter(
      (i) => !logVarList.includes(i)
    );

    for (const i of itemsNotInLogVarList) {
      await RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.LOG_VAR_LIST_INSERT} "${i}"`,
      });
    }

    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.OPEN_LOG_FILE} "${filePath}"`,
    });

    return;
  }

  static async importCSV(itemInfo: CanvasItem) {
    if (!WindowManager.focusIfWindowIsPresent(itemInfo.id as number)) {
      let systemWindowId = null;

      const window = await this.initializePopupWindow(
        itemInfo,
        `#/headless/import-csv?systemWindowId=${systemWindowId}&itemId=${itemInfo.id}`,
        600,
        1100
      );

      systemWindowId = WindowManager.getWindowByUid(itemInfo.id).systemWindowId;

      window.loadURL(
        WindowManager.getWindowUrl(
          `#/headless/import-csv?systemWindowId=${systemWindowId}&itemId=${itemInfo.id}`
        )
      );
    }
  }

  static async cut() {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CUT}`,
    });
    await CommandsManager.requestRedraw();
  }

  static async copy() {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.COPY}`,
    });
    await CommandsManager.requestRedraw();
  }

  static async paste() {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.PASTE}`,
    });
    await CommandsManager.requestRedraw();
  }
}
