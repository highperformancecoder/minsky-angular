import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'minsky-reductions',
  templateUrl: './reductions.component.html',
  styleUrls: ['./reductions.component.scss'],
})
export class ReductionsComponent {
  constructor(public cmService: CommunicationService) {}
}
