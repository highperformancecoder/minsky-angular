import { Injectable } from '@angular/core';
import {
  AppLayoutPayload,
  commandsMapping,
  events,
  HeaderEvent,
  MinskyProcessPayload,
  ReplayRecordingStatus,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from '@minsky/shared';
import { BehaviorSubject } from 'rxjs';
import { WindowUtilityService } from '../WindowUtility/window-utility.service';
import { ElectronService } from './../electron/electron.service';

export class Message {
  id: string;
  body: string;
}

interface ReplayJSON {
  command: string;
  executedAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private isSimulationOn: boolean;
  showPlayButton$ = new BehaviorSubject<boolean>(true);
  t = '0';
  deltaT = '0';

  mouseX: number;
  mouseY: number;

  isShiftPressed = false;
  drag = false;
  showDragCursor$ = new BehaviorSubject(false);
  currentReplayJSON: ReplayJSON[] = [];

  ReplayRecordingStatus$: BehaviorSubject<ReplayRecordingStatus> = new BehaviorSubject(
    ReplayRecordingStatus.ReplayStopped
  );

  delay = 0;
  runUntilTime: number;

  constructor(
    // private socket: Socket,
    private electronService: ElectronService,
    private windowUtilityService: WindowUtilityService // private dialog: MatDialog
  ) {
    this.isSimulationOn = false;

    this.initReplay();
  }

  private async syncRunUntilTime() {
    this.runUntilTime = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.T_MAX,
      render: false,
    })) as number;
  }

  private initReplay() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on(
        events.REPLAY_RECORDING,
        async (event, { json }) => {
          this.ReplayRecordingStatus$.next(ReplayRecordingStatus.ReplayStarted);
          this.currentReplayJSON = json;
          this.showPlayButton$.next(false);

          await this.electronService.ipcRenderer.invoke(events.NEW_SYSTEM);
          this.startReplay();
        }
      );
    }
  }

  startReplay() {
    setTimeout(async () => {
      if (!this.currentReplayJSON.length) {
        this.ReplayRecordingStatus$.next(ReplayRecordingStatus.ReplayStopped);
        this.showPlayButton$.next(true);
        return;
      }

      const { command } = this.currentReplayJSON.shift();

      await this.electronService.sendMinskyCommandAndRender({
        command: command,
      });

      if (
        this.ReplayRecordingStatus$.value ===
        ReplayRecordingStatus.ReplayStarted
      ) {
        this.startReplay();
      }
    }, this.delay || 1);
  }

  stopReplay() {
    this.currentReplayJSON = [];
    this.ReplayRecordingStatus$.next(ReplayRecordingStatus.ReplayStopped);
  }

  pauseReplay() {
    this.ReplayRecordingStatus$.next(ReplayRecordingStatus.ReplayPaused);
  }

  continueReplay() {
    this.ReplayRecordingStatus$.next(ReplayRecordingStatus.ReplayStarted);
    this.startReplay();
  }

  async stepReplay() {
    if (!this.currentReplayJSON.length) {
      return;
    }

    const { command } = this.currentReplayJSON.shift();

    await this.electronService.sendMinskyCommandAndRender({
      command: command,
    });
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
            autoHandleMinskyProcess = false;
            await this.electronService.sendMinskyCommandAndRender({
              command: `${command} [${canvasWidth / 2}, ${
                canvasHeight / 2
              }, ${ZOOM_OUT_FACTOR}]`,
            });
            await this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
            });
            break;
          case 'ZOOM_IN':
            autoHandleMinskyProcess = false;
            await this.electronService.sendMinskyCommandAndRender({
              command: `${command} [${canvasWidth / 2}, ${
                canvasHeight / 2
              }, ${ZOOM_IN_FACTOR}]`,
            });
            await this.electronService.sendMinskyCommandAndRender({
              command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
            });
            break;
          case 'RESET_ZOOM':
            autoHandleMinskyProcess = false;
            await this.resetZoom(canvasWidth / 2, canvasHeight / 2);

            break;
          case 'ZOOM_TO_FIT':
            autoHandleMinskyProcess = false;
            await this.zoomToFit(canvasWidth, canvasHeight);
            break;

          case 'SIMULATION_SPEED':
            autoHandleMinskyProcess = false;
            await this.updateSimulationSpeed(message);

            break;

          case 'PLAY':
            autoHandleMinskyProcess = false;

            this.currentReplayJSON.length
              ? this.continueReplay()
              : this.initSimulation();

            break;

          case 'PAUSE':
            autoHandleMinskyProcess = false;

            this.currentReplayJSON.length
              ? this.pauseReplay()
              : await this.pauseSimulation();

            break;

          case 'RESET':
            autoHandleMinskyProcess = false;

            this.showPlayButton$.next(true);
            this.currentReplayJSON.length
              ? this.stopReplay()
              : await this.stopSimulation();

            break;

          case 'STEP':
            autoHandleMinskyProcess = false;
            this.currentReplayJSON.length
              ? this.stepReplay()
              : await this.stepSimulation();

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
      }
      // else {
      //   this.socket.emit(event, message);
      // }
    } catch (error) {
      console.error(
        '🚀  file: communication.service.ts ~ line 188 ~ CommunicationService ~ sendEvent ~ error',
        error
      );
    }
  }

  private async updateSimulationSpeed(message: HeaderEvent) {
    const speed = message.value as number;

    const currentDelay: number = 12 - (speed * 12) / (150 - 0);

    this.delay = Math.round(Math.pow(10, currentDelay / 4));
  }

  private async stepSimulation() {
    const [t, deltaT] = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.STEP,
    })) as number[];

    this.updateSimulationTime(t, deltaT);
  }

  private async initSimulation() {
    this.isSimulationOn = true;

    this.startSimulation();
  }

  private startSimulation() {
    setTimeout(async () => {
      if (this.isSimulationOn) {
        const [
          t,
          deltaT,
        ] = (await this.electronService.sendMinskyCommandAndRender({
          command: commandsMapping.STEP,
        })) as number[];

        this.updateSimulationTime(t, deltaT);

        this.startSimulation();
      }
    }, this.delay || 1);
  }

  private async pauseSimulation() {
    this.isSimulationOn = false;
  }

  private async stopSimulation() {
    this.isSimulationOn = false;

    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.RESET,
    });

    const t = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.T,
      render: false,
    })) as number;

    const deltaT = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.DELTA_T,
      render: false,
    })) as number;

    this.updateSimulationTime(t, deltaT);
  }

  private updateSimulationTime(t: number, deltaT: number) {
    this.syncRunUntilTime();

    this.t = t.toFixed(2);

    this.deltaT = deltaT.toFixed(2);

    if (Number(this.t) >= this.runUntilTime) {
      this.pauseSimulation();
    }
  }

  private async resetZoom(centerX: number, centerY: number) {
    let command = '';
    const zoomFactor = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.ZOOM_FACTOR,
    })) as number;

    if (zoomFactor > 0) {
      const relZoom = (await this.electronService.sendMinskyCommandAndRender({
        command: commandsMapping.REL_ZOOM,
      })) as number;

      //if relZoom = 0 ;use relZoom as 1 to avoid returning infinity
      command = `${commandsMapping.ZOOM_IN} [${centerX}, ${centerY}, ${
        1 / (relZoom || 1)
      }]`;
    } else {
      command = `${commandsMapping.SET_ZOOM} 1`;
    }

    await this.electronService.sendMinskyCommandAndRender({ command });

    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.RECENTER,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
    });
  }

  private async zoomToFit(canvasWidth: number, canvasHeight: number) {
    const cBounds = (await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.C_BOUNDS,
    })) as number[];

    const zoomFactorX = canvasWidth / (cBounds[2] - cBounds[0]);
    const zoomFactorY = canvasHeight / (cBounds[3] - cBounds[1]);

    const zoomFactor = Math.min(zoomFactorX, zoomFactorY);
    const x = 0.5 * (cBounds[2] + cBounds[0]);
    const y = 0.5 * (cBounds[3] + cBounds[1]);

    const command = `${commandsMapping.ZOOM_IN} [${x},${y},${zoomFactor}]`;

    await this.electronService.sendMinskyCommandAndRender({ command });
    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.RECENTER,
    });
    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
    });
  }

  public async mouseEvents(event, message: MouseEvent) {
    const { type, clientX, clientY, button } = message;
    const offset = this.windowUtilityService.getMinskyCanvasOffset();

    this.mouseX = clientX;
    this.mouseY = clientY - Math.round(offset.top);

    // const clickData = {
    //   type,
    //   clientX,
    //   clientY,
    // };

    if (event === 'contextmenu') {
      this.electronService.ipcRenderer.send(events.CONTEXT_MENU, {
        x: this.mouseX,
        y: this.mouseY,
      });
      return;
    }

    if (button === 2) {
      // on right click
      return;
    }

    if (this.electronService.isElectron) {
      let command = null;
      if (type === 'mousemove') {
        command = commandsMapping.MOUSEMOVE_SUBCOMMAND;
      } else if (type === 'mousedown') {
        command = commandsMapping.MOUSEDOWN_SUBCOMMAND;
      } else if (type === 'mouseup') {
        command = commandsMapping.MOUSEUP_SUBCOMMAND;
      }

      if (command === commandsMapping.MOUSEDOWN_SUBCOMMAND && message.altKey) {
        this.electronService.ipcRenderer.send(
          events.DISPLAY_MOUSE_COORDINATES,
          { mouseX: this.mouseX, mouseY: this.mouseY }
        );
        return;
      }

      // TODO:: Should the drag logic be in this branch or else? isElectron / FE?

      if (
        command === commandsMapping.MOUSEDOWN_SUBCOMMAND &&
        this.isShiftPressed
      ) {
        this.drag = true;
        return;
      }

      if (command === commandsMapping.MOUSEUP_SUBCOMMAND && this.drag) {
        this.drag = false;
        return;
      }

      if (command === commandsMapping.MOUSEMOVE_SUBCOMMAND && this.drag) {
        this.windowUtilityService.getMinskyContainerElement().scrollTop -=
          message.movementY;
        this.windowUtilityService.getMinskyContainerElement().scrollLeft -=
          message.movementX;

        return;
      }

      if (command) {
        await this.electronService.sendMinskyCommandAndRender({
          command: command,
          mouseX: clientX,
          mouseY: this.mouseY,
        });
      }
    }
    // else {
    //   this.socket.emit(event, clickData);
    // }
  }

  async setWindowSizeAndCanvasOffsets(isResizeEvent: boolean) {
    const isMainWindow =
      this.electronService.remote.getCurrentWindow().id === 1;
    // Code for canvas offset values
    if (this.electronService.isElectron && isMainWindow) {
      this.windowUtilityService.reInitialize();
      const offset = this.windowUtilityService.getMinskyCanvasOffset();
      const drawableArea = this.windowUtilityService.getDrawableArea();
      this.electronService.ipcRenderer.send(events.APP_LAYOUT_CHANGED, {
        isResizeEvent: isResizeEvent,
        offset: offset,
        drawableArea: drawableArea,
      } as AppLayoutPayload);
    }
  }

  async addOperation(arg) {
    if (this.electronService.isElectron) {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ADD_OPERATION} "${arg}"`,
      });
    }
  }

  async importData() {
    /*
      1. Add a parameter with name set to "dataimport"
      2. Automatically open the CSV import dialog.
      3. If CSV import is successfully completed / saved -> rename the parameter to the name of the csv file
      4. If CSV import fails or is cancelled -> delete the parameter.
    */
    const variableName = 'dataImport';
    const variableType = 'parameter';

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ADD_VARIABLE} ["${variableName}","${variableType}"]`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_SET_UNITS} ""`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_INIT} ""`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_ROTATION} 0`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_TOOLTIP} ""`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_DETAILED_TEXT} ""`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_SLIDER_MAX} 0`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_SLIDER_MIN} 0`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ITEM_FOCUS_SLIDER_STEP} 0`,
    });

    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.MOUSEUP_SUBCOMMAND,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
    });

    // 2
    const payload: MinskyProcessPayload = {
      mouseX: this.mouseX,
      mouseY: this.mouseY,
    };
    await this.electronService.ipcRenderer.invoke(events.IMPORT_CSV, payload);
  }

  async nop(arg) {}

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

    await this.electronService.sendMinskyCommandAndRender({
      command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
    });
  };

  async handleKeyUp(event: KeyboardEvent) {
    if (!event.shiftKey) {
      this.isShiftPressed = false;
      this.drag = false;
      this.showDragCursor$.next(false);
    }
    return;
  }

  async handleKeyDown(event: KeyboardEvent) {
    const payload: MinskyProcessPayload = {
      command: '',
      key: event.key,
      shift: event.shiftKey,
      capsLock: event.getModifierState('CapsLock'),
      ctrl: event.ctrlKey,
      alt: event.altKey,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      location: event.location,
    };

    // console.table(payload);

    if (event.shiftKey) {
      this.isShiftPressed = true;
      this.showDragCursor$.next(true);
    }

    const multipleKeyString = (await this.electronService.sendMinskyCommandAndRender(
      payload,
      events.KEY_PRESS
    )) as string;

    localStorage.setItem('multipleKeyString', multipleKeyString);
  }

  handleDblClick() {
    this.electronService.ipcRenderer.send(events.DOUBLE_CLICK, {
      mouseX: this.mouseX,
      mouseY: this.mouseY,
    });
  }
}
