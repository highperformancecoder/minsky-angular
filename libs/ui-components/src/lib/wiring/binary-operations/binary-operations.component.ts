import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-binary-operations',
  templateUrl: './binary-operations.component.html',
  styleUrls: ['./binary-operations.component.scss'],
})
export class BinaryOperationsComponent {
  constructor(public cmService: CommunicationService) {}
}
