import { Injectable } from '@angular/core';
import {
  commandsMapping,
  events,
  MinskyProcessPayload,
  retrieveCommandValueFromStdout,
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
    setTimeout(() => {
      simulationCommands.forEach((command) => {
        this.electronService.sendMinskyCommandAndRender({ command });
      });
    }, 4000);
  }

  async getCommandValue(payload: MinskyProcessPayload): Promise<string> {
    try {
      this.electronService.sendMinskyCommandAndRender(payload);

      const res = await Promise.race([
        new Promise((resolve) => {
          this.electronService.ipcRenderer.on(
            events.ipc.MINSKY_PROCESS_REPLY,
            (event, stdout: string) => {
              return resolve(
                retrieveCommandValueFromStdout({
                  stdout,
                  command: payload.command,
                })
              );
            }
          );
        }),
        new Promise((resolve, reject) => {
          setTimeout(function () {
            return reject(`command: "${payload.command}" Timed out`);
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
    } = commandsMapping;

    this.electronService.ipcRenderer.on(
      events.ipc.MINSKY_PROCESS_REPLY,
      (event, stdout: string) => {
        this.minskyProcessReply$.next([
          stdout,
          ...this.minskyProcessReply$.value,
        ]);

        if (stdout.includes(T)) {
          this.t = Number(
            retrieveCommandValueFromStdout({ stdout, command: T })
          ).toFixed(2);
        } else if (stdout.includes(DELTA_T)) {
          this.deltaT = Number(
            retrieveCommandValueFromStdout({ stdout, command: DELTA_T })
          ).toFixed(2);
        } else if (stdout.includes(TIME_UNIT)) {
          this.timeUnit = retrieveCommandValueFromStdout({
            stdout,
            command: TIME_UNIT,
          })
            .trim()
            .split('"')
            .join('');
        } else if (stdout.includes(STEP_MIN)) {
          this.minStepSize = Number(
            retrieveCommandValueFromStdout({ stdout, command: STEP_MIN }).trim()
          );
        } else if (stdout.includes(STEP_MAX)) {
          this.maxStepSize = Number(
            retrieveCommandValueFromStdout({ stdout, command: STEP_MAX }).trim()
          );
        } else if (stdout.includes(T_ZERO)) {
          this.startTime = Number(
            retrieveCommandValueFromStdout({ stdout, command: T_ZERO }).trim()
          );
        } else if (stdout.includes(T_MAX)) {
          this.runUntilTime = retrieveCommandValueFromStdout({
            stdout,
            command: T_MAX,
          }).trim();
        } else if (stdout.includes(EPS_ABS)) {
          this.absoluteError = Number(
            retrieveCommandValueFromStdout({ stdout, command: EPS_ABS }).trim()
          );
        } else if (stdout.includes(EPS_REL)) {
          this.relativeError = Number(
            retrieveCommandValueFromStdout({ stdout, command: EPS_REL }).trim()
          );
        } else if (stdout.includes(ORDER)) {
          this.solverOrder = Number(
            retrieveCommandValueFromStdout({ stdout, command: ORDER }).trim()
          );
        } else if (stdout.includes(IMPLICIT)) {
          const _implicit = retrieveCommandValueFromStdout({
            stdout,
            command: IMPLICIT,
          }).trim();
          this.implicitSolver = _implicit === 'false' ? false : true;
        } else if (stdout.includes(SIMULATION_SPEED)) {
          this.noOfStepsPerIteration = Number(
            retrieveCommandValueFromStdout({
              stdout,
              command: SIMULATION_SPEED,
            }).trim()
          );
        } else if (stdout.includes(X)) {
          this.modelX = Number(
            retrieveCommandValueFromStdout({ stdout, command: X }).trim()
          );
        } else if (stdout.includes(Y)) {
          this.modelY = Number(
            retrieveCommandValueFromStdout({ stdout, command: Y }).trim()
          );
        }
      }
    );
  }
}
