import { Injectable } from '@angular/core';
import {
  commandsMapping,
  events,
  HeaderEvent,
  minskyProcessReplyIndicators,
  WindowUtilitiesGlobal,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from '@minsky/shared';
import * as debug from 'debug';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { StateManagementService } from '../state-management/state-management.service';
import { ElectronService } from './../electron/electron.service';

const logInfo = debug('minsky:web:info');
export class Message {
  id: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  canvasElement: HTMLElement;
  sticky: number;
  directory = new BehaviorSubject<string[]>([]);
  openDirectory = new BehaviorSubject<string[]>([]);

  stepIntervalId;
  showPlayButton$ = new BehaviorSubject<boolean>(true);
  mouseX: number;
  mouseY: number;

  constructor(
    private socket: Socket,
    private electronService: ElectronService,
    private stateManagementService: StateManagementService
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

  public async sendEvent(event: string, message: HeaderEvent) {
    const { target } = message;
    if (this.electronService.isElectron) {
      let command = commandsMapping[target];
      const dimensions = WindowUtilitiesGlobal.getDrawableArea();
      const canvasWidth = dimensions.width;
      const canvasHeight = dimensions.height;
      
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
          autoHandleMinskyProcess = false;
          /* this.electronService.sendMinskyCommandAndRender({
            command: `${commandsMapping.MOVE_TO} [0,0]`,
          });

          this.electronService.sendMinskyCommandAndRender({
            command: `${command} ${RESET_ZOOM_FACTOR}`,
          });
           */

          this.electronService.sendMinskyCommandAndRender({
            command: `${await this.getResetZoomCommand()}`,
          });

          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.RECENTER,
          });
          break;
        case 'ZOOM_TO_FIT':
          autoHandleMinskyProcess = false;

          command = `${command} [${await this.getZoomToFitArgs(
            canvasWidth,
            canvasHeight
          )}]`;

          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.RECENTER,
          });

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

  private async getResetZoomCommand() {
    /*
     if {[minsky.model.zoomFactor]>0} {
            zoom [expr 1/[minsky.model.relZoom]]
        } else {
            minsky.model.setZoom 1
        }
        recentreCanvas

    */

    const zoomFactor = Number(
      await this.stateManagementService.getCommandValue(
        commandsMapping.ZOOM_FACTOR,
        minskyProcessReplyIndicators.ZOOM_FACTOR
      )
    );

    if (zoomFactor > 0) {
      const relZoom = Number(
        await this.stateManagementService.getCommandValue(
          commandsMapping.REL_ZOOM,
          minskyProcessReplyIndicators.REL_ZOOM
        )
      );
      //if relZoom = 0 ;use relZoom as 1 to avoid returning infinity
      return `${commandsMapping.ZOOM_IN} ${1 / (relZoom || 1)}`;
    } else {
      return `${commandsMapping.SET_ZOOM} 1`;
    }
  }

  private async getZoomToFitArgs(canvasWidth: number, canvasHeight: number) {
    /*
      set cb [minsky.canvas.model.cBounds]
        set z1 [expr double([winfo width .wiring.canvas])/([lindex $cb 2]-[lindex $cb 0])]
        set z2 [expr double([winfo height .wiring.canvas])/([lindex $cb 3]-[lindex $cb 1])]
        if {$z2<$z1} {set z1 $z2}
        set x [expr -0.5*([lindex $cb 2]+[lindex $cb 0])]
        set y [expr -0.5*([lindex $cb 3]+[lindex $cb 1])]
        zoomAt $x $y $z1
        recentreCanvas
    */

    const cBoundsString = await this.stateManagementService.getCommandValue(
      commandsMapping.C_BOUNDS,
      minskyProcessReplyIndicators.C_BOUNDS
    );

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

    this.mouseX = clientX;
    this.mouseY = clientY;

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
          mouseY: clientY,
        });
      }
    } else {
      this.socket.emit(event, clickData);
    }
  }

  /*   public dispatchEvents(eventName) {
    this.socket.on(eventName, (data) => {
      // common code for dispatch events
      logInfo('Event received', data);
      document.querySelector(data.id).dispatchEvent(data.event);
    });
  } */

  canvasOffsetValues() {
    // code for canvas offset values
    document.addEventListener('DOMContentLoaded', () => {
      // When the event DOMContentLoaded occurs, it is safe to access the DOM

      const offset = WindowUtilitiesGlobal.getMinskyCanvasOffset();
      const offSetValue = 'top:' + offset.top + ' ' + 'left:' + offset.left;

      if (this.electronService.isElectron) {
        this.electronService.ipcRenderer.send(
          events.ipc.APP_LAYOUT_CHANGED,
          { type: 'OFFSET', value: offset }
        );

        this.electronService.ipcRenderer.send(
          events.ipc.APP_LAYOUT_CHANGED,
          {
            type: 'CANVAS',
            value: WindowUtilitiesGlobal.getDrawableArea(),
          }
        );
      } else {
        this.emitValues('Values', offSetValue);
      }
    });

    /*  if (!this.electronService.isElectron) {
      this.dispatchEvents('Values');
    } */
  }

  addOperation(arg) {
    if (this.electronService.isElectron) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ADD_OPERATION} "${arg}"`,
      });
    }
  }

  insertElement(command) {
    if (this.electronService.isElectron) {
      this.electronService.sendMinskyCommandAndRender({
        command: commandsMapping[command],
      });
    }
  }

  onMouseWheelZoom = (event: WheelEvent) => {
    event.preventDefault();
    const { deltaY } = event;
    const zoomIn = deltaY < 0;
    const offset = WindowUtilitiesGlobal.getMinskyCanvasOffset();

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
}
