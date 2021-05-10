import { commandsMapping } from '@minsky/shared';
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
}
