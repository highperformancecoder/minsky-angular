import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CommunicationService, ElectronService } from '@minsky/core';
import {
  commandsMapping,
  events,
  minskyProcessReplyIndicators,
} from '@minsky/shared';

@Component({
  selector: 'minsky-simulation-parameters',
  templateUrl: './simulation-parameters.component.html',
  styleUrls: ['./simulation-parameters.component.scss'],
})
export class SimulationParametersComponent implements OnInit {
  form: FormGroup;
  simulationCommands: string[];

  get timeUnit() {
    return this.form.get('timeUnit');
  }
  get minStepSize() {
    return this.form.get('minStepSize');
  }
  get maxStepSize() {
    return this.form.get('maxStepSize');
  }
  get noOfStepsPerIteration() {
    return this.form.get('noOfStepsPerIteration');
  }
  get startTime() {
    return this.form.get('startTime');
  }
  get runUntilTime() {
    return this.form.get('runUntilTime');
  }
  get absoluteError() {
    return this.form.get('absoluteError');
  }
  get relativeError() {
    return this.form.get('relativeError');
  }
  get solverOrder() {
    return this.form.get('solverOrder');
  }
  get implicitSolver() {
    return this.form.get('implicitSolver');
  }

  constructor(
    private electronService: ElectronService,
    private communicationService: CommunicationService
  ) {
    this.form = new FormGroup({
      timeUnit: new FormControl(''),
      minStepSize: new FormControl(null),
      maxStepSize: new FormControl(null),
      noOfStepsPerIteration: new FormControl(null),
      startTime: new FormControl(null),
      runUntilTime: new FormControl(null),
      absoluteError: new FormControl(null),
      relativeError: new FormControl(null),
      solverOrder: new FormControl(null),
      implicitSolver: new FormControl(false),
    });

    this.simulationCommands = [
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
  }

  ngOnInit() {
    if (this.electronService.isElectron) {
      this.simulationCommands.forEach((command) => {
        this.communicationService.sendMinskyCommandAndRender({ command });
      });

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
      } = minskyProcessReplyIndicators;
      this.electronService.ipcRenderer.on(
        events.ipc.MINSKY_PROCESS_REPLY,
        (event, stdout: string) => {
          if (stdout.includes(TIME_UNIT)) {
            const _timeUnit = stdout
              .split('=>')
              .pop()
              .trim()
              .split('"')
              .join('');
            this.timeUnit.setValue(_timeUnit);
          } else if (stdout.includes(STEP_MIN)) {
            const _stepMin = Number(stdout.split('=>').pop().trim());
            this.minStepSize.setValue(_stepMin);
          } else if (stdout.includes(STEP_MAX)) {
            const _stepMax = Number(stdout.split('=>').pop().trim());
            this.maxStepSize.setValue(_stepMax);
          } else if (stdout.includes(T_ZERO)) {
            const _tZero = Number(stdout.split('=>').pop().trim());
            this.startTime.setValue(_tZero);
          } else if (stdout.includes(T_MAX)) {
            const tMax = stdout.split('=>').pop().trim();
            this.runUntilTime.setValue(tMax);
          } else if (stdout.includes(EPS_ABS)) {
            const _epsAbs = Number(stdout.split('=>').pop().trim());
            this.absoluteError.setValue(_epsAbs);
          } else if (stdout.includes(EPS_REL)) {
            const _epsRel = Number(stdout.split('=>').pop().trim());
            this.relativeError.setValue(_epsRel);
          } else if (stdout.includes(ORDER)) {
            const _order = Number(stdout.split('=>').pop().trim());
            this.solverOrder.setValue(_order);
          } else if (stdout.includes(IMPLICIT)) {
            const _implicit = stdout.split('=>').pop().trim();
            this.implicitSolver.setValue(_implicit === 'false' ? false : true);
          } else if (stdout.includes(SIMULATION_SPEED)) {
            const _nSteps = Number(stdout.split('=>').pop().trim());
            this.noOfStepsPerIteration.setValue(_nSteps);
          }
        }
      );
    }
  }

  handleSubmit() {
    if (this.electronService.isElectron) {
      const formValues = this.form.value;

      for (const key of Object.keys(formValues)) {
        const arg = formValues[key];

        switch (key) {
          case 'timeUnit':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.TIME_UNIT} "${arg}"`,
            });
            break;

          case 'minStepSize':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.STEP_MIN} ${arg}`,
            });
            break;

          case 'maxStepSize':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.STEP_MAX} ${arg}`,
            });
            break;

          case 'noOfStepsPerIteration':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.SIMULATION_SPEED} ${arg}`,
            });
            break;

          case 'startTime':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.T_ZERO} ${arg}`,
            });
            break;

          case 'runUntilTime':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.T_MAX} ${arg}`,
            });
            break;

          case 'absoluteError':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.EPS_ABS} ${arg}`,
            });
            break;

          case 'relativeError':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.EPS_REL} ${arg}`,
            });
            break;

          case 'solverOrder':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.ORDER} ${arg}`,
            });
            break;

          case 'implicitSolver':
            this.communicationService.sendMinskyCommandAndRender({
              command: `${commandsMapping.IMPLICIT} ${arg}`,
            });
            break;

          default:
            break;
        }
      }
    }
  }

  handleCancel() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
