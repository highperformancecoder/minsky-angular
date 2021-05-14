import {
  CanvasItem,
  ClassType,
  commandsMapping,
  isEmptyObject,
  rendererAppURL,
  toBoolean,
} from '@minsky/shared';
import { dialog } from 'electron';
import { RestServiceManager } from './restServiceManager';
import { WindowManager } from './windowManager';

export class CommandsManager {
  static async getItemAt(
    x: number,
    y: number
  ): Promise<Record<string, unknown>> {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
    });

    const item: Record<string, unknown> = JSON.parse(
      (
        await RestServiceManager.getCommandValue({
          command: commandsMapping.CANVAS_ITEM,
        })
      ).replace(/\bnan\b/g, null)
    );

    return item;
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
      RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const classTypeRes = (
      await RestServiceManager.getCommandValue({
        command: commandsMapping.CANVAS_ITEM_CLASS_TYPE,
      })
    ).slice(1, -1);

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
      RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const value = Number(
      await RestServiceManager.getCommandValue({
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

      RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const name = String(
      await RestServiceManager.getCommandValue({
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

      RestServiceManager.handleMinskyProcess({
        command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
      });
    }

    const description = String(
      await RestServiceManager.getCommandValue({
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
    console.log(
      '🚀 ~ file: commandsManager.ts ~ line 139 ~ CommandsManager ~ getItemInfo ~ itemInfo',
      itemInfo
    );
    return itemInfo;
  }

  static async getWireAt(
    x: number,
    y: number
  ): Promise<Record<string, unknown>> {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_WIRE_AT} [${x},${y}]`,
    });

    const wire: Record<string, unknown> = JSON.parse(
      await RestServiceManager.getCommandValue({
        command: commandsMapping.CANVAS_WIRE,
      })
    );

    return wire;
  }

  static addOperation(operation: string): void {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_OPERATION} "${operation}"`,
    });

    return;
  }

  static addPlot(): void {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_PLOT}`,
    });

    return;
  }

  static addGodley(): void {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ADD_GODLEY}`,
    });

    return;
  }

  static async selectVar(x: number, y: number): Promise<boolean> {
    const selectVar = toBoolean(
      await RestServiceManager.getCommandValue({
        command: `${commandsMapping.CANVAS_SELECT_VAR} [${x},${y}]`,
      })
    );

    return selectVar;
  }

  static async flip(): Promise<void> {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_ITEM_FLIP}`,
    });

    const defaultRotation = Number(
      await RestServiceManager.getCommandValue({
        command: `${commandsMapping.CANVAS_DEFAULT_ROTATION}`,
      })
    );

    const newRotation = (defaultRotation + 180) % 360;

    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_DEFAULT_ROTATION} ${newRotation}`,
    });

    return;
  }

  /*

  proc exportItemAsCSV {} {
    global workDir
    set f [tk_getSaveFile -defaultextension .csv -filetypes {
        {"CSV" .csv TEXT} {"All" {.*} TEXT}
    } -initialdir $workDir ]
    if {$f!=""} {
        set workDir [file dirname $f]
        eval minsky.canvas.item.exportAsCSV {$f}
    }
}

proc exportItemAsImg {} {
    global workDir type
    set f [tk_getSaveFile -filetypes [imageFileTypes] -initialdir $workDir -typevariable type ]
    if {$f==""} return
    set workDir [file dirname $f]
    renderImage $f $type minsky.canvas.item
}

  */

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

    RestServiceManager.handleMinskyProcess({
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
      url: `${rendererAppURL}/#/headless/rename-all-instances?name=${
        name?.slice(1, 1) || ''
      }`,
      height: 100,
      width: 200,
    });
  }
  // static exportItemAsImg() {}
}
