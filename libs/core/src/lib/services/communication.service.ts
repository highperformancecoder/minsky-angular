import { Injectable } from '@angular/core';
import * as debug from 'debug';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from './electron.service';

const logInfo = debug('minsky:web:info');
export class Message {
  id: string;
  body: string;
}

interface HeaderEvent {
  action: string;
  target: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  canvasDetail: HTMLElement;
  sticky: number;
  windowHeight: number;
  windowWidth: number;
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
    this.socket.emit(event, message);

    if (this.electronService.isElectron) {
      const metadata = {
        top: this.topOffset,
        left: this.leftOffset,
        height: this.windowHeight,
        width: this.windowWidth,
      };

      this.electronService.ipcRenderer.send('cairo', {
        ...message,
        ...metadata,
        event,
      });
    }
  }

  public mouseEvents(event, message) {
    const clickData = {
      type: message.type,
      clientX: message.clientX,
      clientY: message.clientY,
    };
    if (this.electronService.isElectron) {
      const metadata = {
        top: this.topOffset,
        left: this.leftOffset,
        height: this.windowHeight,
        width: this.windowWidth,
      };

      this.electronService.ipcRenderer.send('cairo', {
        ...clickData,
        ...metadata,
        event,
      });
    }
    this.socket.emit(event, clickData);
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

      this.emitValues('Values', offSetValue);
    });

    this.dispatchEvents('Values');
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
