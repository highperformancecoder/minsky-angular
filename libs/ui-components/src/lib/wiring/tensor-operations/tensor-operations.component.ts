import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-tensor-operations',
  templateUrl: './tensor-operations.component.html',
  styleUrls: ['./tensor-operations.component.scss'],
})
export class TensorOperationsComponent {
  constructor(public cmService: CommunicationService) {}
}
