import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.scss'],
})
export class ScansComponent {
  operations: string[];

  constructor(public cmService: CommunicationService) {
    this.operations = ['runningSum', 'runningProduct', 'difference'];
  }
}
