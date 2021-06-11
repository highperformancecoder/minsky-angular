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
  private isSimulationOn: boolean;
  private simulationTimerId: number;
  showPlayButton$ = new BehaviorSubject<boolean>(true);
  mouseX: number;
  mouseY: number;
  t = '0';
  deltaT = '0';

  constructor(
    private socket: Socket,
    private electronService: ElectronService,
    private windowUtilityService: WindowUtilityService
  ) {
    this.isSimulationOn = false;
  }

  setBackgroundColor(color = null) {
    if (this.electronService.isElectron)
      this.electronService.ipcRenderer.send(events.SET_BACKGROUND_COLOR, {
        color: color,
      });
  }

  public async sendEvent(event: string, message: HeaderEvent) {
    try {
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
            this.isSimulationOn = true;
            await this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.START_SIMULATION,
            });

            this.triggerUpdateTime();

            break;

          case 'PAUSE':
            autoHandleMinskyProcess = false;
            this.isSimulationOn = false;
            this.clearSimulationTimer();

            await this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.PAUSE_SIMULATION,
            });

            break;

          case 'RESET':
            autoHandleMinskyProcess = false;
            this.isSimulationOn = false;
            this.clearSimulationTimer();
            this.showPlayButton$.next(true);

            // await this.electronService.sendMinskyCommandAndRender({ command });

            await this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.STOP_SIMULATION,
            });

            await this.updateSimulationTime();
            break;

          case 'STEP':
            autoHandleMinskyProcess = false;
            await this.electronService.sendMinskyCommandAndRender({ command });
            await this.updateSimulationTime();

            break;

          case 'REVERSE_CHECKBOX':
            command = `${command} ${message.value}`;
            break;

          default:
            break;
        }

        if (command && autoHandleMinskyProcess) {
          await this.electronService.sendMinskyCommandAndRender({ command });
        }
      } else {
        this.socket.emit(event, message);
      }
    } catch (error) {
      console.error(
        '🚀  file: communication.service.ts ~ line 188 ~ CommunicationService ~ sendEvent ~ error',
        error
      );
    }
  }

  private triggerUpdateTime() {
    this.clearSimulationTimer();
    this.simulationTimerId = window.setTimeout(async () => {
      await this.updateSimulationTime();
      if (this.isSimulationOn) {
        this.triggerUpdateTime();
      }
    }, 10); // TODO:: Should we change the delay?
  }

  private async updateSimulationTime() {
    this.t = ((await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.T,
    })) as number).toFixed(2);

    this.deltaT = ((await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.DELTA_T,
    })) as number).toFixed(2);
  }

  private async getResetZoomCommand(centerX: number, centerY: number) {
    const zoomFactor = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.ZOOM_FACTOR,
    })) as number;

    if (zoomFactor > 0) {
      const relZoom = (await this.electronService.sendMinskyCommandAndRender({
        command: commandsMapping.REL_ZOOM,
      })) as number;

      //if relZoom = 0 ;use relZoom as 1 to avoid returning infinity
      return `${commandsMapping.ZOOM_IN} [${centerX}, ${centerY}, ${
        1 / (relZoom || 1)
      }]`;
    } else {
      return `${commandsMapping.SET_ZOOM} 1`;
    }
  }

  private async getZoomToFitArgs(canvasWidth: number, canvasHeight: number) {
    const cBounds = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.C_BOUNDS,
    })) as number[];

    const zoomFactorX = canvasWidth / (cBounds[2] - cBounds[0]);
    const zoomFactorY = canvasHeight / (cBounds[3] - cBounds[1]);

    const zoomFactor = Math.min(zoomFactorX, zoomFactorY);
    const x = 0.5 * (cBounds[2] + cBounds[0]);
    const y = 0.5 * (cBounds[3] + cBounds[1]);

    return [x, y, zoomFactor].toString();
  }

  private clearSimulationTimer() {
    if (this.simulationTimerId) {
      window.clearTimeout(this.simulationTimerId);
    }
    this.simulationTimerId = null;
  }

  public async mouseEvents(event, message) {
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
        await this.electronService.sendMinskyCommandAndRender({
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
        this.electronService.ipcRenderer.send(events.APP_LAYOUT_CHANGED, {
          type: 'OFFSET',
          value: offset,
        });

        this.electronService.ipcRenderer.send(events.APP_LAYOUT_CHANGED, {
          type: 'CANVAS',
          value: this.windowUtilityService.getDrawableArea(),
        });
      }
    });
  }

  async addOperation(arg) {
    if (this.electronService.isElectron) {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ADD_OPERATION} "${arg}"`,
      });
    }
  }

  async insertElement(command, arg = null, type = null) {
    if (this.electronService.isElectron) {
      let _cmd = commandsMapping[command];
      let _arg = arg;

      if (arg) {
        if (type === 'string') {
          _arg = `"${_arg}"`;
        }

        _cmd = `${_cmd} ${_arg}`;
      }

      await this.electronService.sendMinskyCommandAndRender({
        command: _cmd,
      });
    }
  }

  onMouseWheelZoom = async (event: WheelEvent) => {
    event.preventDefault();
    const { deltaY } = event;
    const zoomIn = deltaY < 0;
    const offset = this.windowUtilityService.getMinskyCanvasOffset();

    const command = commandsMapping.ZOOM_IN;
    const x = event.clientX - offset.left;
    const y = event.clientY - offset.top;
    let zoomFactor = null;
    if (zoomIn) {
      zoomFactor = ZOOM_IN_FACTOR;
    } else {
      zoomFactor = ZOOM_OUT_FACTOR;
    }

    await this.electronService.sendMinskyCommandAndRender({
      command,
      args: {
        x,
        y,
        zoomFactor,
      },
    });
  };

  async handleKeyPress(event: KeyboardEvent) {
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

    await this.electronService.sendMinskyCommandAndRender(
      payload,
      events.KEY_PRESS
    );
  }
}
