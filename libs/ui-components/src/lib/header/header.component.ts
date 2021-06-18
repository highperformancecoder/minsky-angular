import { Component, OnDestroy } from '@angular/core';
import { CommunicationService, ElectronService } from '@minsky/core';
import {
  events,
  HeaderEvent,
  RecordingStatus,
  ReplayRecordingStatus,
} from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  headerEvent = 'HEADER_EVENT';
  isRecordingOn = false;
  isReplayRecordingOn = false;

  constructor(
    public commService: CommunicationService,
    private electronService: ElectronService
  ) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on(
        events.RECORDING_STATUS_CHANGED,
        (event, { status }) => {
          switch (status) {
            case RecordingStatus.RecordingStarted:
              this.isRecordingOn = true;
              break;

            case RecordingStatus.RecordingStopped:
            case RecordingStatus.RecordingCanceled:
              this.isRecordingOn = false;
              break;

            default:
              break;
          }
        }
      );

      this.commService.ReplayRecordingStatus$.subscribe(
        (status: ReplayRecordingStatus) => {
          switch (status) {
            case ReplayRecordingStatus.ReplayStarted:
              this.isReplayRecordingOn = true;
              break;

            case ReplayRecordingStatus.ReplayStopped:
              this.isReplayRecordingOn = false;
              break;

            default:
              break;
          }
        }
      );
    }
  }

  async handleToolbarEvent(event: HeaderEvent) {
    await this.commService.sendEvent(this.headerEvent, event);
  }

  recordButton() {
    this.commService.sendEvent(this.headerEvent, {
      action: 'CLICKED',
      target: 'RECORD',
    });
  }

  recordingReplyButton() {
    this.commService.sendEvent(this.headerEvent, {
      action: 'CLICKED',
      target: 'RECORDING_REPLAY',
    });
  }

  reverseCheckboxButton(event) {
    this.commService.sendEvent(this.headerEvent, {
      action: 'CLICKED',
      target: 'REVERSE_CHECKBOX',
      value: event.target.checked,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
