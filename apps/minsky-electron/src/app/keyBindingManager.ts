import {
  availableOperations,
  commandsMapping,
  isEmptyObject,
  MinskyProcessPayload,
  rendererAppURL,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from '@minsky/shared';
import { BrowserWindow } from 'electron';
import * as keysym from 'keysym';
import * as utf8 from 'utf8';
import { CommandsManager } from './commandsManager';
import { RestServiceManager } from './restServiceManager';
import { WindowManager } from './windowManager';

export class KeyBindingManager {
  static multipleKeyString = '';
  static multipleKeyWindow: BrowserWindow = null;
  static isMultipleKeyModalOpen = false;

  static async handleOnKeyPress(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    const {
      key,
      shift,
      capsLock,
      ctrl,
      alt,
      mouseX,
      mouseY,
      command = '',
    } = payload;

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
      const _payload: MinskyProcessPayload = {};

      _payload.command = command
        ? `${command}/keyPress [${_keysym},"${_utf8}",${modifierKeyCode},${mouseX},${mouseY}]`
        : `${commandsMapping.KEY_PRESS} [${_keysym},"${_utf8}",${modifierKeyCode},${mouseX},${mouseY}]`;

      const isKeyPressHandled = await RestServiceManager.handleMinskyProcess(
        _payload
      );

      if (!isKeyPressHandled && !command) {
        return await this.handleOnKeyPressFallback(payload);
      }

      return isKeyPressHandled;
    }
    const res = command ? false : await this.handleOnKeyPressFallback(payload);

    return res;
  }

  private static async handleOnKeyPressFallback(payload: MinskyProcessPayload) {
    let executed = true;
    const { key } = payload;

    switch (key) {
      case 'Backspace':
      case 'Delete':
        await this.deleteKey(payload);
        break;

      case '+':
        await this.handlePlusKey(payload);
        break;

      case '-':
        await this.handleMinusKey(payload);
        break;

      case '*':
        await CommandsManager.addOperation(availableOperations.MULTIPLY);
        await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

        break;

      case '/':
        await CommandsManager.addOperation(availableOperations.DIVIDE);
        await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

        break;

      case '^':
        await CommandsManager.addOperation(availableOperations.POW);
        await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

        break;

      case '&':
        await CommandsManager.addOperation(availableOperations.INTEGRATE);
        await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

        break;

      case '=':
        await CommandsManager.addGodley();
        await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

        break;

      case '@':
        await CommandsManager.addPlot();
        await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

        break;

      case 'x':
      case 'X':
        if (payload.ctrl && !payload.alt && !payload.shift) {
          await CommandsManager.cut();
        }
        break;

      case 'c':
      case 'C':
        if (payload.ctrl && !payload.alt && !payload.shift) {
          await CommandsManager.copy();
        }

        break;

      case 'v':
      case 'V':
        if (payload.ctrl && !payload.alt && !payload.shift) {
          await CommandsManager.paste();
        }
        break;

      default:
        executed = false;
        break;
    }

    if (payload.ctrl) {
      // avoiding conflict with shortCuts (electron accelerators)
      return;
    }

    const asciiRegex = /[ -~]/;

    if (!executed && key.length === 1 && key.match(asciiRegex)) {
      this.multipleKeyString += key;
      if (!this.isMultipleKeyModalOpen) {
        this.multipleKeyWindow = WindowManager.createMenuPopUpWithRouting({
          title: 'Text Input',
          url: `#/headless/multiple-key-operation?input=${this.multipleKeyString}`,
          width: 300,
          height: 130,
        });

        this.isMultipleKeyModalOpen = true;

        this.multipleKeyWindow.on('close', () => {
          this.isMultipleKeyModalOpen = false;
          this.multipleKeyString = '';
          this.multipleKeyWindow = null;
        });
      }

      if (this.multipleKeyWindow) {
        this.multipleKeyWindow.loadURL(
          `${rendererAppURL}#/headless/multiple-key-operation?input=${encodeURIComponent(
            this.multipleKeyString
          )}`
        );
      }
    }

    return executed;
  }

  private static async handlePlusKey(payload: MinskyProcessPayload) {
    if (payload.shift) {
      // <Key-plus>
      await CommandsManager.addOperation(availableOperations.ADD);
      await CommandsManager.mouseUp(payload.mouseX, payload.mouseY);

      return;
    }

    // <Key-KP_Add>
    await this.zoom(ZOOM_IN_FACTOR);
    return;
  }

  private static async handleMinusKey(payload: MinskyProcessPayload) {
    if (payload.shift) {
      // <Key-minus>
      // TODO: ask @janak
      return;
    }

    // <Key-KP_Subtract>
    await this.zoom(ZOOM_OUT_FACTOR);
    return;
  }

  private static async zoom(factor: number) {
    const cBounds = JSON.parse(
      (await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.C_BOUNDS,
      })) as string
    );

    const x = 0.5 * (cBounds[2] + cBounds[0]);
    const y = 0.5 * (cBounds[3] + cBounds[1]);

    this.zoomAt(x, y, factor);
    return;
  }

  private static async zoomAt(x: number, y: number, zoomFactor: number) {
    await RestServiceManager.handleMinskyProcess({
      command: `${commandsMapping.ZOOM_IN} [${x},${y},${zoomFactor}]`,
    });

    await CommandsManager.requestRedraw();
    return;
  }

  private static async deleteKey(payload: MinskyProcessPayload) {
    const { mouseX, mouseY } = payload;

    const isCanvasSelectionEmpty = (await RestServiceManager.handleMinskyProcess(
      {
        command: commandsMapping.CANVAS_SELECTION_EMPTY,
      }
    )) as boolean;

    if (!isCanvasSelectionEmpty) {
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CUT,
      });
      return;
    }

    const item = await CommandsManager.getItemAt(mouseX, mouseY);
    if (!isEmptyObject(item)) {
      const itemId = await CommandsManager.getCurrentItemId();
      await CommandsManager.deleteCurrentItemHavingId(itemId);
      return;
    }
    const wire = await CommandsManager.getWireAt(mouseX, mouseY);
    if (!isEmptyObject(wire)) {
      await RestServiceManager.handleMinskyProcess({
        command: commandsMapping.CANVAS_DELETE_WIRE,
      });
      return;
    }
  }
}
