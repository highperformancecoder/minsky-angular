import { Component, OnInit } from '@angular/core';
import { CommunicationService, ElectronService } from '@minsky/core';
import { HeaderEvent, minskyProcessReplyIndicators } from '@minsky/shared';
import * as debug from 'debug';

const logInfo = debug('minsky:web:info');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  headerEvent = 'HEADER_EVENT';
  constructor(
    private commService: CommunicationService,
    private electronService: ElectronService
  ) {}

  t = '0';
  deltaT = '0';

  ngOnInit(): void {
    this.handleTime();
  }

  handleTime() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on(
        'minsky-process-reply',
        (event, stdout: string) => {
          if (stdout.includes(minskyProcessReplyIndicators.T)) {
            this.t = Number(stdout.split('=>').pop()).toFixed(2);
          } else if (stdout.includes(minskyProcessReplyIndicators.DELTA_T)) {
            this.deltaT = Number(stdout.split('=>').pop()).toFixed(2);
          }
        }
      );
    }
  }

  handleToolbarEvent(event: HeaderEvent) {
    this.commService.sendEvent(this.headerEvent, event);
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
