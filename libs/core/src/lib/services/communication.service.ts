import { Injectable } from '@angular/core';
import {
  commandsMapping,
  events,
  HeaderEvent,
  MinskyProcessPayload,
  RESET_ZOOM_FACTOR,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
  ZOOM_TO_FIT_FACTOR,
} from '@minsky/shared';
import * as debug from 'debug';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from './electron.service';

const logInfo = debug('minsky:web:info');
export class Message {
  id: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  canvasDetail: HTMLElement;
  sticky: number;
  leftOffset: number;
  topOffset: number;
  directory = new BehaviorSubject<string[]>([]);
  openDirectory = new BehaviorSubject<string[]>([]);

  stepIntervalId;
  showPlayButton$ = new BehaviorSubject<boolean>(true);

  constructor(
    private socket: Socket,
    private electronService: ElectronService
  ) {
    if (electronService.isElectron) {
      this.electronService.ipcRenderer.on('Save_file', (event, result) => {
        this.directory.next(result);
      });

      this.electronService.ipcRenderer.on('Open_file', (event, result) => {
        this.openDirectory.next(result);
      });
    }
  }

  public emitValues(message, data) {
    this.socket.emit(message, data);
  }

  setBackgroundColor(color = null) {
    if (this.electronService.isElectron)
      this.electronService.ipcRenderer.send(events.ipc.SET_BACKGROUND_COLOR, {
        color: color,
      });
  }

  initMinskyResources() {
    if (this.electronService.isElectron) {
      this.setGodleyIconResource();

      this.setGroupIconResource();
    }
  }

  private setGroupIconResource() {
    const groupIconResourcePayload: MinskyProcessPayload = {
      command: commandsMapping.SET_GROUP_ICON_RESOURCE,
    };

    this.sendMinskyCommand(groupIconResourcePayload);
  }

  private setGodleyIconResource() {
    const godleyIconPayload: MinskyProcessPayload = {
      command: commandsMapping.SET_GODLEY_ICON_RESOURCE,
    };

    this.sendMinskyCommand(godleyIconPayload);
  }

  sendMinskyCommandAndRender(minskyProcessPayload: MinskyProcessPayload) {
    if (this.electronService.isElectron) {
      this.sendMinskyCommand(minskyProcessPayload);

      this.sendMinskyRenderCommand();
    }
  }

  sendMinskyCommand(payload: MinskyProcessPayload) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.ipc.MINSKY_PROCESS, {
        ...payload,
        command: payload.command.trim(),
      });
    }
  }

  public sendEvent(event: string, message: HeaderEvent): void {
    const { target } = message;
    if (this.electronService.isElectron) {
      let command = commandsMapping[target];

      const canvasWidth = this.canvasDetail.offsetWidth;
      const canvasHeight = this.canvasDetail.offsetHeight;

      let autoHandleMinskyProcess = true;

      switch (target) {
        case 'ZOOM_OUT':
          command = ` ${command} [${canvasWidth / 2},${
            canvasHeight / 2
          },${ZOOM_OUT_FACTOR}]`;
          break;
        case 'ZOOM_IN':
          command = `${command} [${canvasWidth / 2},${
            canvasHeight / 2
          },${ZOOM_IN_FACTOR}]`;
          break;
        case 'RESET_ZOOM':
          // TODO: calculate zoom factor using c bounds OR there should be a command for this "/minsky/resetZoom"
          command = `${command} [${canvasWidth / 2},${
            canvasHeight / 2
          },${RESET_ZOOM_FACTOR}]`;
          break;
        case 'ZOOM_TO_FIT':
          // TODO: calculate zoom factor using c bounds OR there should be a command for this "/minsky/zoomToFit"
          command = `${command} [${canvasWidth / 2},${
            canvasHeight / 2
          },${ZOOM_TO_FIT_FACTOR}]`;
          break;

        case 'SIMULATION_SPEED':
          command = `${command} ${message.value}`;
          break;

        case 'PLAY':
          autoHandleMinskyProcess = false;

          this.stepIntervalId = setInterval(() => {
            const payload: MinskyProcessPayload = {
              command,
            };

            this.sendMinskyCommandAndRender(payload);
            this.sendMinskyCommandAndRender({ command: commandsMapping.T });
          }, 1000);
          break;

        case 'PAUSE':
          autoHandleMinskyProcess = false;

          this.clearStepInterval();
          break;

        case 'RESET':
          autoHandleMinskyProcess = false;

          this.showPlayButton$.next(true);
          this.clearStepInterval();

          this.sendMinskyCommandAndRender({ command });
          this.sendMinskyCommandAndRender({
            command: commandsMapping.T,
          });
          break;

        case 'STEP':
          autoHandleMinskyProcess = false;
          this.sendMinskyCommandAndRender({ command });
          this.sendMinskyCommandAndRender({ command: commandsMapping.T });
          break;

        case 'REVERSE_CHECKBOX':
          command = `${command} ${message.value}`;
          break;

        default:
          break;
      }

      if (command && autoHandleMinskyProcess) {
        const payload: MinskyProcessPayload = {
          command,
        };

        this.sendMinskyCommandAndRender(payload);
      }
    } else {
      this.socket.emit(event, message);
    }
  }

  private clearStepInterval() {
    if (this.stepIntervalId) {
      clearInterval(this.stepIntervalId);
    }
  }

  public mouseEvents(event, message) {
    const { type, clientX, clientY } = message;

    const clickData = {
      type,
      clientX,
      clientY,
    };

    if (this.electronService.isElectron) {
      const command = commandsMapping[type];

      if (command) {
        const payload: MinskyProcessPayload = {
          command: command,
          mouseX: clientX,
          mouseY: clientY,
        };
        this.sendMinskyCommandAndRender(payload);
      }
    } else {
      this.socket.emit(event, clickData);
    }
  }

  sendMinskyRenderCommand() {
    if (this.electronService.isElectron) {
      const payload: MinskyProcessPayload = {
        command: commandsMapping.RENDER_FRAME,
      };
      this.sendMinskyCommand(payload);
    }
  }

  public dispatchEvents(eventName) {
    this.socket.on(eventName, (data) => {
      // common code for dispatch events
      logInfo('Event received', data);
      document.querySelector(data.id).dispatchEvent(data.event);
    });
  }

  canvasOffsetValues() {
    // code for canvas offset values
    document.addEventListener('DOMContentLoaded', () => {
      // When the event DOMContentLoaded occurs, it is safe to access the DOM

      this.canvasDetail = document.getElementById('canvas');

      // Get the offset position of the canvas
      this.topOffset = this.canvasDetail.offsetTop;
      this.leftOffset = this.canvasDetail.offsetLeft;

      const offSetValue =
        'top:' + this.topOffset + ' ' + 'left:' + this.leftOffset;

      if (this.electronService.isElectron) {
        const payload = {
          type: 'OFFSET',
          value: { top: this.topOffset, left: this.leftOffset },
        };

        this.electronService.ipcRenderer.send(
          events.ipc.APP_LAYOUT_CHANGED,
          payload
        );
      } else {
        this.emitValues('Values', offSetValue);
      }
    });

    if (!this.electronService.isElectron) {
      this.dispatchEvents('Values');
    }
  }

  addOperation(arg) {
    if (this.electronService.isElectron) {
      this.sendMinskyCommand({
        command: `${commandsMapping.ADD_OPERATION} "${arg}"`,
      });
    }
  }

  insertElement(command) {
    if (this.electronService.isElectron) {
      this.sendMinskyCommand({
        command: commandsMapping[command],
      });
    }
  }
}
