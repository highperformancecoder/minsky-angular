import { commandsMapping, toBoolean } from '@minsky/shared';
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

  static async getItemClassType(x: number, y: number): Promise<string> {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.CANVAS_GET_ITEM_AT} [${x},${y}]`,
    });

    const classType = await RestServiceManager.getCommandValue({
      command: commandsMapping.CANVAS_ITEM_CLASS_TYPE,
    });

    return classType;
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
}
