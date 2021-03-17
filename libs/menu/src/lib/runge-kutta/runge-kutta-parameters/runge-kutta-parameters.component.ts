import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-runge-kutta-parameters',
  templateUrl: './runge-kutta-parameters.component.html',
  styleUrls: ['./runge-kutta-parameters.component.scss'],
})
export class RungeKuttaParametersComponent {
  constructor(private electronService: ElectronService) {}
}
