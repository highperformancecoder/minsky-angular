import { Component, OnInit } from '@angular/core';

import { CommunicationService } from './../../communication.service';
import { HeaderEvent } from '../../../interfaces/FEEvents';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  HEADER_EVENT: HeaderEvent;
  constructor(private commService: CommunicationService) {}

  ngOnInit() {}

  buttonClicked() {
    // this.commService
  }

  recordButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'RECORD_BUTTON',
    });
    console.log('recordButtons');
  }
  recordingReplyButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'RECORDING_REPLAY_BUTTON',
    });
    console.log('recordingReplyButton');
  }
  reverseCheckboxButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'REVERSE_CHECKBOX_BUTTON',
    });
    console.log('reverseCheckboxButton');
  }
  stopButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'STOP_BUTTON',
    });
    console.log('stopButton');
  }
}
