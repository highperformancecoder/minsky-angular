import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-functions',
  templateUrl: './functions.component.html',
  styleUrls: ['./functions.component.scss'],
})
export class FunctionsComponent {
  operations: string[];

  constructor(public cmService: CommunicationService) {
    this.operations = [
      'sqrt',
      'exp',
      'ln',
      'sin',
      'cos',
      'tan',
      'asin',
      'acos',
      'atan',
      'sinh',
      'cosh',
      'tanh',
      'abs',
      'floor',
      'frac',
      'not_',
      'Gamma',
      'fact',
    ];
  }
}
