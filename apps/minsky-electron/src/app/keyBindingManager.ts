import {
  commandsMapping,
  isEmptyObject,
  MinskyProcessPayload,
  toBoolean,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from '@minsky/shared';
import * as keysym from 'keysym';
import * as utf8 from 'utf8';
import { CommandsManager } from './commandsManager';
import { RestServiceManager } from './restServiceManager';

export class KeyBindingManager {
  static async handleOnKeyPress(payload: MinskyProcessPayload) {
    const { key, shift, capsLock, ctrl, alt, mouseX, mouseY } = payload;

    const _keysym = keysym.fromName(key)?.keysym;

    const _utf8 = utf8.encode(key);

    const __payload = { ...payload, keySym: _keysym, utf8: _utf8 };
    console.table(__payload);

    let modifierKeyCode = 0;
    if (shift) {
      modifierKeyCode += 1;
    }
    if (capsLock) {
      modifierKeyCode += 2;
    }
    if (ctrl) {
      modifierKeyCode += 4;
    }
    if (alt) {
      modifierKeyCode += 8;
    }

    if (_keysym) {
      const _payload = {
        command: `${commandsMapping.KEY_PRESS} [${_keysym},${_utf8},${modifierKeyCode},${mouseX},${mouseY}]`,
      };

      const isKeyPressHandled = await RestServiceManager.getCommandValue(
        _payload
      );

      if (isKeyPressHandled === 'false') {
        await this.handleOnKeyPressFallback(payload);
      }
    }

    await this.handleOnKeyPressFallback(payload);
  }

  private static async handleOnKeyPressFallback(payload: MinskyProcessPayload) {
    switch (payload.key) {
      case 'Backspace':
      case 'Delete':
        await this.deleteKey(payload);
        break;

      case '+':
        await this.zoom(ZOOM_IN_FACTOR);
        break;

      case '-':
        await this.zoom(ZOOM_OUT_FACTOR);
        break;

      default:
        break;
    }
  }

  private static async zoom(factor: number) {
    const cBounds = JSON.parse(
      await RestServiceManager.getCommandValue({
        command: commandsMapping.C_BOUNDS,
      })
    );

    const x = 0.5 * (cBounds[2] + cBounds[0]);
    const y = 0.5 * (cBounds[3] + cBounds[1]);

    console.log(
      '🚀 ~ file: keyBindingManager.ts ~ line 111 ~ KeyBindingManager ~ zoomIn ~ x, y, zoomFactor',
      x,
      y,
      factor
    );
    this.zoomAt(x, y, factor);
    return;
  }

  private static zoomAt(x: number, y: number, zoomFactor: number) {
    RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ZOOM_IN} [${x},${y},${zoomFactor}]`,
    });

    RestServiceManager.handleMinskyProcess({
      command: commandsMapping.CANVAS_REQUEST_REDRAW,
    });
    return;
  }

  private static async deleteKey(payload: MinskyProcessPayload) {
    const { mouseX, mouseY } = payload;

    const isCanvasSelectionEmpty = toBoolean(
      await RestServiceManager.getCommandValue({
        command: commandsMapping.CANVAS_SELECTION_EMPTY,
      })
    );

    if (!isCanvasSelectionEmpty) {
      RestServiceManager.handleMinskyProcess({ command: commandsMapping.CUT });
      return;
    }

    const item = await CommandsManager.getItemAt(mouseX, mouseY);

    if (!isEmptyObject(item)) {
      RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_DELETE_ITEM,
      });
      return;
    }

    const wire = await CommandsManager.getWireAt(mouseX, mouseY);

    if (!isEmptyObject(wire)) {
      RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_DELETE_WIRE,
      });
      return;
    }
  }
}
