import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-euler',
  templateUrl: './euler.component.html',
  styleUrls: ['./euler.component.scss'],
})
export class EulerComponent {
  operations: string[];

  constructor(public communicationService: CommunicationService) {
    this.operations = ['euler', 'pi', 'zero', 'one', 'inf', 'percent'];
  }
}
