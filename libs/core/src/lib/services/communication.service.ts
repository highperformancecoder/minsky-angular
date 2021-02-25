import { Injectable } from '@angular/core';
import { CairoPayload, HeaderEvent } from '@minsky/shared';
import * as debug from 'debug';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';
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

  public sendEvent(event: string, message: HeaderEvent) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('cairo', {
        ...message,
        event,
      });
    } else {
      this.socket.emit(event, message);
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
      let command = '';
      switch (type) {
        case 'mousemove':
          command = `/minsky/canvas/mouseMove`;
          break;
        case 'mouseup':
          command = '/minsky/canvas/mouseUp';
          break;
        case 'mousedown':
          command = '/minsky/canvas/mouseDown';
          break;

        default:
          break;
      }

      if (command) {
        command = `${command} [${clientX},${clientY}]`;

        const payload: CairoPayload = {
          command,
        };

        this.electronService.ipcRenderer.send('cairo', payload);

        this.render();
      }
    } else {
      this.socket.emit(event, clickData);
    }
  }

  render() {
    if (this.electronService.isElectron) {
      const payload: CairoPayload = {
        command: '/minsky/canvas/renderFrame',
      };

      this.electronService.ipcRenderer.send('cairo', payload);
    }
  }

  public dispatchEvents(eventName) {
    this.socket.on(eventName, (data) => {
      // common code for dispatch events
      logInfo('Event received', data);
      document.querySelector(data.id).dispatchEvent(data.event);
    });
  }

  public getMessages = () => {
    return new Observable((observer) => {
      this.socket.on('RESPONSE', (message) => {
        observer.next(message);
        logInfo(message);
      });
    });
  };

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
