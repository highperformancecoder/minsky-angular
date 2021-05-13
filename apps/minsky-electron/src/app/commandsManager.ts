import {
  CanvasItem,
  ClassType,
  commandsMapping,
  isEmptyObject,
  toBoolean,
} from '@minsky/shared';
import { dialog } from 'electron';
import { RestServiceManager } from './restServiceManager';

export class CommandsManager {
  static async getItemAt(
    x: number,
    y: number
  ): Promise<Record<string, unknown>> {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
    });

    const item: Record<string, unknown> = JSON.parse(
      await RestServiceManager.getCommandValue({
        command: commandsMapping.CANVAS_ITEM,
      })
    );

    return item;
  }

  static async getItemClassType(
    x: number,
    y: number,
    reInvokeGetItemAt = false
  ): Promise<ClassType> {
    if (reInvokeGetItemAt) {
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

  static async getItemValue(
    x: number,
    y: number,
    reInvokeGetItemAt = false
  ): Promise<number> {
    if (reInvokeGetItemAt) {
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

  static async getItemInfo(x: number, y: number): Promise<CanvasItem> {
    const item = await this.getItemAt(x, y);
    console.log(
      '🚀 ~ file: commandsManager.ts ~ line 78 ~ CommandsManager ~ getItemInfo ~ item',
      item
    );

    if (isEmptyObject(item)) {
      return null;
    }

    const classType = await this.getItemClassType(x, y);
    console.log(
      '🚀 ~ file: commandsManager.ts ~ line 85 ~ CommandsManager ~ getItemInfo ~ classType',
      classType
    );

    const value = await this.getItemValue(x, y);

    const itemInfo: CanvasItem = { classType, value };
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

    console.log(
      '🚀 ~ file: commandsManager.ts ~ line 155 ~ CommandsManager ~ flipDefault ~ newRotation',
      newRotation
    );

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
      command: `${commandsMapping.EXPORT_ALL_PLOTS_AS_CSV} "${filePath}"`,
    });
  }

  // static exportItemAsImg() {}
}
