import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-simulation-parameters',
  templateUrl: './simulation-parameters.component.html',
  styleUrls: ['./simulation-parameters.component.scss'],
})
export class SimulationParametersComponent {
  form: FormGroup;

  constructor(private electronService: ElectronService) {
    this.form = new FormGroup({
      timeUnit: new FormControl(null),
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
  }

  handleSubmit() {
    console.log(
      '🚀 ~ file: simulation-parameters.component.ts ~ line 31 ~ SimulationParametersComponent ~ handleSubmit ~ this.form.value',
      this.form.value
    );
  }

  handleCancel() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
