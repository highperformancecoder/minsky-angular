import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-binary-operations',
  templateUrl: './binary-operations.component.html',
  styleUrls: ['./binary-operations.component.scss'],
})
export class BinaryOperationsComponent {
  operations: string[];
  constructor(public cmService: CommunicationService) {
    this.operations = [
      'add',
      'subtract',
      'multiply',
      'divide',
      'min',
      'max',
      'and_',
      'or_',
      'log',
      'pow',
      'polygamma',
      'lt',
      'le',
      'eq',
    ];
  }
}
