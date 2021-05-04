import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElectronService, StateManagementService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';

@Component({
  selector: 'minsky-simulation-parameters',
  templateUrl: './simulation-parameters.component.html',
  styleUrls: ['./simulation-parameters.component.scss'],
})
export class SimulationParametersComponent implements OnInit {
  form: FormGroup;

  constructor(
    private electronService: ElectronService,
    private stateManagementService: StateManagementService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      timeUnit: new FormControl(this.stateManagementService.timeUnit),
      minStepSize: new FormControl(this.stateManagementService.minStepSize),
      maxStepSize: new FormControl(this.stateManagementService.maxStepSize),
      noOfStepsPerIteration: new FormControl(
        this.stateManagementService.noOfStepsPerIteration
      ),
      startTime: new FormControl(this.stateManagementService.startTime),
      runUntilTime: new FormControl(this.stateManagementService.runUntilTime),
      absoluteError: new FormControl(this.stateManagementService.absoluteError),
      relativeError: new FormControl(this.stateManagementService.relativeError),
      solverOrder: new FormControl(this.stateManagementService.solverOrder),
      implicitSolver: new FormControl(
        this.stateManagementService.implicitSolver
      ),
    });
  }

  handleSubmit() {
    if (this.electronService.isElectron) {
      const formValues = this.form.value;

      for (const key of Object.keys(formValues)) {
        const arg = formValues[key];

        switch (key) {
          case 'timeUnit':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.TIME_UNIT} "${arg}"`,
            });
            break;

          case 'minStepSize':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.STEP_MIN} ${arg}`,
            });
            break;

          case 'maxStepSize':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.STEP_MAX} ${arg}`,
            });
            break;

          case 'noOfStepsPerIteration':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.SIMULATION_SPEED} ${arg}`,
            });
            break;

          case 'startTime':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.T_ZERO} ${arg}`,
            });
            break;

          case 'runUntilTime':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.T_MAX} ${arg}`,
            });
            break;

          case 'absoluteError':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.EPS_ABS} ${arg}`,
            });
            break;

          case 'relativeError':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.EPS_REL} ${arg}`,
            });
            break;

          case 'solverOrder':
            this.electronService.sendMinskyCommandAndRender({
              command: `${commandsMapping.ORDER} ${arg}`,
            });
            break;

          case 'implicitSolver':
            this.electronService.sendMinskyCommandAndRender({
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
