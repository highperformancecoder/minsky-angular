import { Component } from '@angular/core';
import { CommunicationService, StateManagementService } from '@minsky/core';
import { HeaderEvent } from '@minsky/shared';
import * as debug from 'debug';

const logInfo = debug('minsky:web:info');

@Component({
  selector: 'minsky-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  headerEvent = 'HEADER_EVENT';
  constructor(
    private commService: CommunicationService,
    public stateManagementService: StateManagementService
  ) {}

  async handleToolbarEvent(event: HeaderEvent) {
    await this.commService.sendEvent(this.headerEvent, event);
  }

  recordButton() {
    this.commService.sendEvent(this.headerEvent, {
      action: 'CLICKED',
      target: 'RECORD',
    });
    logInfo('recordButtons');
  }

  recordingReplyButton() {
    this.commService.sendEvent(this.headerEvent, {
      action: 'CLICKED',
      target: 'RECORDING_REPLAY',
    });
    logInfo('recordingReplyButton');
  }

  reverseCheckboxButton(event) {
    this.commService.sendEvent(this.headerEvent, {
      action: 'CLICKED',
      target: 'REVERSE_CHECKBOX',
      value: event.target.checked,
    });
    logInfo('reverseCheckboxButton');
  }
}
