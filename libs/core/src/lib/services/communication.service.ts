import { Injectable } from '@angular/core';
import {
  CairoPayload,
  commandsMapping,
  HeaderEvent,
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

  initMinskyResources() {
    if (this.electronService.isElectron) {
      this.setGodleyIconResource();

      this.setGroupIconResource();
    }
  }

  private setGroupIconResource() {
    const groupIconResourcePayload: CairoPayload = {
      command: commandsMapping.SET_GROUP_ICON_RESOURCE,
    };

    this.sendCairoEvent(groupIconResourcePayload);
  }

  private setGodleyIconResource() {
    const godleyIconPayload: CairoPayload = {
      command: commandsMapping.SET_GODLEY_ICON_RESOURCE,
    };

    this.sendCairoEvent(godleyIconPayload);
  }

  sendCairoEventAndRender(cairoPayload: CairoPayload) {
    if (this.electronService.isElectron) {
      this.sendCairoEvent(cairoPayload);

      this.sendCairoRenderEvent();
    }
  }

  sendCairoEvent(payload: CairoPayload) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('cairo', {
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
          // TODO:
          command = `${command} [${canvasWidth / 2},${
            canvasHeight / 2
          },${RESET_ZOOM_FACTOR}]`;
          break;
        case 'ZOOM_TO_FIT':
          // TODO:
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
            const payload: CairoPayload = {
              command,
            };

            this.sendCairoEventAndRender(payload);
          }, 1000);
          break;

        case 'PAUSE':
          autoHandleMinskyProcess = false;

          this.clearStepInterval();
          break;

        case 'RESET':
          this.showPlayButton$.next(true);
          this.clearStepInterval();
          break;

        default:
          break;
      }

      if (command && autoHandleMinskyProcess) {
        const payload: CairoPayload = {
          command,
        };

        this.sendCairoEventAndRender(payload);
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
        const payload: CairoPayload = {
          command: command,
          mouseX: clientX,
          mouseY: clientY,
        };
        this.sendCairoEventAndRender(payload);
      }
    } else {
      this.socket.emit(event, clickData);
    }
  }

  sendCairoRenderEvent() {
    if (this.electronService.isElectron) {
      const payload: CairoPayload = {
        command: commandsMapping.RENDER_FRAME,
      };
      this.sendCairoEvent(payload);
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

      window.addEventListener('scroll', this.canvasSticky);
      this.canvasDetail = document.getElementById('offsetValue');

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

        this.electronService.ipcRenderer.send('app-layout-changed', payload);
      } else {
        this.emitValues('Values', offSetValue);
      }
    });

    if (!this.electronService.isElectron) {
      this.dispatchEvents('Values');
    }
  }

  canvasSticky() {
    if (window.pageYOffset >= this.sticky) {
      logInfo('window.pageYOffset >= sticky');
    } else {
      logInfo('Not window.pageYOffset >= sticky');
    }
    if (window.pageYOffset >= this.sticky) {
      this.canvasDetail.classList.add('sticky');
    } else {
      this.canvasDetail.classList.remove('sticky');
    }
  }
}
