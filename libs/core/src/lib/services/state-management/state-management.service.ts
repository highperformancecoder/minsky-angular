import { Injectable } from '@angular/core';
import {
  commandsMapping,
  events,
  MinskyProcessPayload,
  minskyProcessReplyIndicators,
} from '@minsky/shared';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from './../electron/electron.service';

@Injectable({
  providedIn: 'root',
})
export class StateManagementService {
  minskyProcessReply$ = new BehaviorSubject<Array<string>>([]);

  t = '0';
  deltaT = '0';

  timeUnit: string;
  minStepSize: number;
  maxStepSize: number;
  startTime: number;
  runUntilTime: string;
  absoluteError: number;
  relativeError: number;
  solverOrder: number;
  implicitSolver: boolean;
  noOfStepsPerIteration: number;

  modelX = 0;
  modelY = 0;

  constructor(private electronService: ElectronService) {}

  init() {
    if (this.electronService.isElectron) {
      this.invokeCommands();

      this.initListeners();
    }
  }

  private invokeCommands() {
    const simulationCommands = [
      commandsMapping.T_ZERO,
      commandsMapping.T_MAX,
      commandsMapping.EPS_ABS,
      commandsMapping.TIME_UNIT,
      commandsMapping.STEP_MIN,
      commandsMapping.STEP_MAX,
      commandsMapping.EPS_REL,
      commandsMapping.ORDER,
      commandsMapping.IMPLICIT,
      commandsMapping.SIMULATION_SPEED,
      commandsMapping.X,
      commandsMapping.Y,
    ];

    simulationCommands.forEach((command) => {
      this.electronService.sendMinskyCommandAndRender({ command });
    });
  }

  async getCommandValue(
    payload: MinskyProcessPayload,
    minskyProcessReplyIndicator: string
  ): Promise<string> {
    try {
      this.electronService.sendMinskyCommandAndRender(payload);

      const res = await Promise.race([
        new Promise((resolve) => {
          this.electronService.ipcRenderer.on(
            events.ipc.MINSKY_PROCESS_REPLY,
            (event, stdout: string) => {
              if (stdout.includes(minskyProcessReplyIndicator)) {
                resolve(stdout.split('=>').pop().trim());
              }
            }
          );
        }),
        new Promise((resolve, reject) => {
          setTimeout(function () {
            reject(
              `command: "${payload.command}" with minskyProcessReplyIndicator "${minskyProcessReplyIndicator}" Timed out`
            );
          }, 4000);
        }),
      ]);

      console.log(`command: ${payload.command}, value:${res}`);
      return res as string;
    } catch (error) {
      console.error(
        '🚀 ~ file: state-management.service.ts ~ line 118 ~ StateManagementService ~ getCommandValue ~ error',
        error
      );

      throw error;
    }
  }

  private initListeners() {
    const {
      EPS_ABS,
      T_ZERO,
      T_MAX,
      TIME_UNIT,
      STEP_MIN,
      STEP_MAX,
      SIMULATION_SPEED,
      ORDER,
      IMPLICIT,
      EPS_REL,
      T,
      DELTA_T,
      X,
      Y,
    } = minskyProcessReplyIndicators;

    this.electronService.ipcRenderer.on(
      events.ipc.MINSKY_PROCESS_REPLY,
      (event, stdout: string) => {
        this.minskyProcessReply$.next([
          stdout,
          ...this.minskyProcessReply$.value,
        ]);

        if (stdout.includes(T)) {
          this.t = Number(stdout.split('=>').pop()).toFixed(2);
        } else if (stdout.includes(DELTA_T)) {
          this.deltaT = Number(stdout.split('=>').pop()).toFixed(2);
        } else if (stdout.includes(TIME_UNIT)) {
          this.timeUnit = stdout.split('=>').pop().trim().split('"').join('');
        } else if (stdout.includes(STEP_MIN)) {
          this.minStepSize = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(STEP_MAX)) {
          this.maxStepSize = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(T_ZERO)) {
          this.startTime = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(T_MAX)) {
          this.runUntilTime = stdout.split('=>').pop().trim();
        } else if (stdout.includes(EPS_ABS)) {
          this.absoluteError = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(EPS_REL)) {
          this.relativeError = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(ORDER)) {
          this.solverOrder = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(IMPLICIT)) {
          const _implicit = stdout.split('=>').pop().trim();
          this.implicitSolver = _implicit === 'false' ? false : true;
        } else if (stdout.includes(SIMULATION_SPEED)) {
          this.noOfStepsPerIteration = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(X)) {
          this.modelX = Number(stdout.split('=>').pop().trim());
        } else if (stdout.includes(Y)) {
          this.modelY = Number(stdout.split('=>').pop().trim());
        }
      }
    );
  }
}
