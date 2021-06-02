import { Injectable } from '@angular/core';
import {
  commandsMapping,
  events,
  HeaderEvent,
  MinskyProcessPayload,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from '@minsky/shared';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { StateManagementService } from '../state-management/state-management.service';
import { WindowUtilityService } from '../WindowUtility/window-utility.service';
import { ElectronService } from './../electron/electron.service';

export class Message {
  id: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  stepIntervalId;
  showPlayButton$ = new BehaviorSubject<boolean>(true);
  mouseX: number;
  mouseY: number;

  constructor(
    private socket: Socket,
    private electronService: ElectronService,
    private stateManagementService: StateManagementService,
    private windowUtilityService: WindowUtilityService
  ) {}

  setBackgroundColor(color = null) {
    if (this.electronService.isElectron)
      this.electronService.ipcRenderer.send(events.ipc.SET_BACKGROUND_COLOR, {
        color: color,
      });
  }

  public async sendEvent(event: string, message: HeaderEvent) {
    const { target } = message;
    if (this.electronService.isElectron) {
      let command = commandsMapping[target];
      const dimensions = this.windowUtilityService.getDrawableArea();

      const canvasWidth = dimensions.width;
      const canvasHeight = dimensions.height;

      let autoHandleMinskyProcess = true;

      switch (target) {
        case 'ZOOM_OUT':
          command = `${command} [${canvasWidth / 2}, ${
            canvasHeight / 2
          }, ${ZOOM_OUT_FACTOR}]`;
          break;
        case 'ZOOM_IN':
          command = `${command} [${canvasWidth / 2}, ${
            canvasHeight / 2
          }, ${ZOOM_IN_FACTOR}]`;
          break;
        case 'RESET_ZOOM':
          command = `${await this.getResetZoomCommand(
            canvasWidth / 2,
            canvasHeight / 2
          )}`;

          break;
        case 'ZOOM_TO_FIT':
          command = `${command} [${await this.getZoomToFitArgs(
            canvasWidth,
            canvasHeight
          )}]`;

          break;

        case 'SIMULATION_SPEED':
          command = `${command} ${message.value}`;
          break;

        case 'PLAY':
          autoHandleMinskyProcess = false;

          this.stepIntervalId = setInterval(() => {
            this.electronService.sendMinskyCommandAndRender({ command });
            this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.T,
            });
            this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.DELTA_T,
            });
          }, 100); // TODO:: -> Make this delay configurable
          break;

        case 'PAUSE':
          autoHandleMinskyProcess = false;

          this.clearStepInterval();
          break;

        case 'RESET':
          autoHandleMinskyProcess = false;

          this.showPlayButton$.next(true);
          this.clearStepInterval();

          this.electronService.sendMinskyCommandAndRender({ command });
          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.T,
          });
          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.DELTA_T,
          });
          break;

        case 'STEP':
          autoHandleMinskyProcess = false;
          this.electronService.sendMinskyCommandAndRender({ command });
          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.T,
          });
          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.DELTA_T,
          });
          break;

        case 'REVERSE_CHECKBOX':
          command = `${command} ${message.value}`;
          break;

        default:
          break;
      }

      if (command && autoHandleMinskyProcess) {
        this.electronService.sendMinskyCommandAndRender({ command });
      }
    } else {
      this.socket.emit(event, message);
    }
  }

  private async getResetZoomCommand(centerX: number, centerY: number) {
    const zoomFactor = Number(
      await this.stateManagementService.getCommandValue({
        command: commandsMapping.ZOOM_FACTOR,
      })
    );

    if (zoomFactor > 0) {
      const relZoom = Number(
        await this.stateManagementService.getCommandValue({
          command: commandsMapping.REL_ZOOM,
        })
      );
      //if relZoom = 0 ;use relZoom as 1 to avoid returning infinity
      return `${commandsMapping.ZOOM_IN} [${centerX}, ${centerY}, ${
        1 / (relZoom || 1)
      }]`;
    } else {
      return `${commandsMapping.SET_ZOOM} 1`;
    }
  }

  private async getZoomToFitArgs(canvasWidth: number, canvasHeight: number) {
    const cBoundsString = await this.stateManagementService.getCommandValue({
      command: commandsMapping.C_BOUNDS,
    });

    const cBounds = JSON.parse(cBoundsString as string);

    const zoomFactorX = canvasWidth / (cBounds[2] - cBounds[0]);
    const zoomFactorY = canvasHeight / (cBounds[3] - cBounds[1]);

    const zoomFactor = Math.min(zoomFactorX, zoomFactorY);
    const x = 0.5 * (cBounds[2] + cBounds[0]);
    const y = 0.5 * (cBounds[3] + cBounds[1]);

    return [x, y, zoomFactor].toString();
  }

  private clearStepInterval() {
    if (this.stepIntervalId) {
      clearInterval(this.stepIntervalId);
    }
  }

  public mouseEvents(event, message) {
    const { type, clientX, clientY } = message;

    const offset = this.windowUtilityService.getMinskyCanvasOffset();

    this.mouseX = clientX;
    // this.mouseY = clientY - offset.electronTop + 68;
    this.mouseY = clientY - offset.electronTop;

    const clickData = {
      type,
      clientX,
      clientY,
    };

    if (this.electronService.isElectron) {
      const command = commandsMapping[type];

      if (command) {
        this.electronService.sendMinskyCommandAndRender({
          command: command,
          mouseX: clientX,
          mouseY: this.mouseY,
        });
      }
    } else {
      this.socket.emit(event, clickData);
    }
  }

  canvasOffsetValues() {
    // code for canvas offset values
    document.addEventListener('DOMContentLoaded', () => {
      // When the event DOMContentLoaded occurs, it is safe to access the DOM

      const offset = this.windowUtilityService.getMinskyCanvasOffset();

      if (this.electronService.isElectron) {
        this.electronService.ipcRenderer.send(events.ipc.APP_LAYOUT_CHANGED, {
          type: 'OFFSET',
          value: offset,
        });

        this.electronService.ipcRenderer.send(events.ipc.APP_LAYOUT_CHANGED, {
          type: 'CANVAS',
          value: this.windowUtilityService.getDrawableArea(),
        });
      }
    });
  }

  addOperation(arg) {
    if (this.electronService.isElectron) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ADD_OPERATION} "${arg}"`,
      });
    }
  }

  insertElement(command, arg = null, type = null) {
    if (this.electronService.isElectron) {
      let _cmd = commandsMapping[command];
      let _arg = arg;

      if (arg) {
        if (type === 'string') {
          _arg = `"${_arg}"`;
        }

        _cmd = `${_cmd} ${_arg}`;
      }

      this.electronService.sendMinskyCommandAndRender({
        command: _cmd,
      });
    }
  }

  onMouseWheelZoom = (event: WheelEvent) => {
    event.preventDefault();
    const { deltaY } = event;
    const zoomIn = deltaY < 0;
    const offset = this.windowUtilityService.getMinskyCanvasOffset();

    let command = null;
    if (zoomIn) {
      command = `${commandsMapping.ZOOM_IN} [${event.clientX - offset.left},${
        event.clientY - offset.top
      }, ${ZOOM_IN_FACTOR}]`;
    } else {
      command = `${commandsMapping.ZOOM_OUT} [${event.clientX - offset.left},${
        event.clientY - offset.top
      }, ${ZOOM_OUT_FACTOR}]`;
    }

    this.electronService.sendMinskyCommandAndRender({ command });
  };

  handleKeyPress(event: KeyboardEvent) {
    const payload: MinskyProcessPayload = {
      command: commandsMapping.KEY_PRESS,
      key: event.key,
      shift: event.shiftKey,
      capsLock: event.getModifierState('CapsLock'),
      ctrl: event.ctrlKey,
      alt: event.altKey,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
    };

    console.table(payload);

    this.electronService.sendMinskyCommandAndRender(
      payload,
      events.ipc.KEY_PRESS
    );
  }
}
