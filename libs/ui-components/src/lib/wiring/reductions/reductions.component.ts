import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-reductions',
  templateUrl: './reductions.component.html',
  styleUrls: ['./reductions.component.scss'],
})
export class ReductionsComponent {
  operations: string[];
  constructor(public cmService: CommunicationService) {
    this.operations = [
      'sum',
      'product',
      'infimum',
      'supremum',
      'any',
      'all',
      'infIndex',
      'supIndex',
    ];
  }
}
