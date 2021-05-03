import { Injectable } from '@angular/core';
import {
  commandsMapping,
  events,
  minskyProcessReplyIndicators,
} from '@minsky/shared';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from './../electron/electron.service';

@Injectable({
  providedIn: 'root',
})
export class StateManagementService {
  isTerminalDisabled$ = new BehaviorSubject<boolean>(true);
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
    ];

    simulationCommands.forEach((command) => {
      this.electronService.sendMinskyCommandAndRender({ command });
    });
  }

  async getCommandValue(command: string, minskyProcessReplyIndicator: string) {
    try {
      this.electronService.sendMinskyCommandAndRender({ command });

      const res = await Promise.race([
        new Promise((resolve, reject) => {
          this.electronService.ipcRenderer.on(
            events.ipc.MINSKY_PROCESS_REPLY,
            (event, stdout: string) => {
              if (stdout.includes(minskyProcessReplyIndicator)) {
                resolve(stdout.split('=>').pop());
              }
            }
          );
        }),
        new Promise((resolve, reject) => {
          setTimeout(function () {
            reject(
              `command: "${command}" with minskyProcessReplyIndicator "${minskyProcessReplyIndicator}" Timed out`
            );
          }, 4000);
        }),
      ]);

      console.log(`command: ${command}, value:${res}`);
      return res;
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
      MINSKY_PROCESS_START,
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
        } else if (stdout.includes(MINSKY_PROCESS_START)) {
          this.isTerminalDisabled$.next(false);
        } else if (stdout.includes(TIME_UNIT)) {
          const _timeUnit = stdout.split('=>').pop().trim().split('"').join('');
          this.timeUnit = _timeUnit;
        } else if (stdout.includes(STEP_MIN)) {
          const _stepMin = Number(stdout.split('=>').pop().trim());
          this.minStepSize = _stepMin;
        } else if (stdout.includes(STEP_MAX)) {
          const _stepMax = Number(stdout.split('=>').pop().trim());
          this.maxStepSize = _stepMax;
        } else if (stdout.includes(T_ZERO)) {
          const _tZero = Number(stdout.split('=>').pop().trim());
          this.startTime = _tZero;
        } else if (stdout.includes(T_MAX)) {
          const tMax = stdout.split('=>').pop().trim();
          this.runUntilTime = tMax;
        } else if (stdout.includes(EPS_ABS)) {
          const _epsAbs = Number(stdout.split('=>').pop().trim());
          this.absoluteError = _epsAbs;
        } else if (stdout.includes(EPS_REL)) {
          const _epsRel = Number(stdout.split('=>').pop().trim());
          this.relativeError = _epsRel;
        } else if (stdout.includes(ORDER)) {
          const _order = Number(stdout.split('=>').pop().trim());
          this.solverOrder = _order;
        } else if (stdout.includes(IMPLICIT)) {
          const _implicit = stdout.split('=>').pop().trim();
          this.implicitSolver = _implicit === 'false' ? false : true;
        } else if (stdout.includes(SIMULATION_SPEED)) {
          const _nSteps = Number(stdout.split('=>').pop().trim());
          this.noOfStepsPerIteration = _nSteps;
        }
      }
    );
  }
}
