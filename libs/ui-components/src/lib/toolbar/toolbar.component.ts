import { Component, EventEmitter, Output } from '@angular/core';
import { CommunicationService } from '@minsky/core';
import { HeaderEvent } from '@minsky/shared';

@Component({
  selector: 'minsky-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() toolbarEvent = new EventEmitter<HeaderEvent>();

  headerEvent = 'HEADER_EVENT';

  constructor(public communicationService: CommunicationService) {}

  playButton() {
    if (this.communicationService.showPlayButton$.value) {
      this.toolbarEvent.emit({
        action: 'CLICKED',
        target: 'PLAY',
      });
    } else {
      this.toolbarEvent.emit({
        action: 'CLICKED',
        target: 'PAUSE',
      });
    }

    this.communicationService.showPlayButton$.next(
      !this.communicationService.showPlayButton$.value
    );
  }

  resetButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'RESET',
    });
  }

  stepButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'STEP',
    });
  }

  simulationSpeed(value) {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'SIMULATION_SPEED',
      value: value,
    });
  }

  zoomOutButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOM_OUT',
    });
  }

  zoomInButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOM_IN',
    });
  }

  resetZoomButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'RESET_ZOOM',
    });
  }

  zoomToFitButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOM_TO_FIT',
    });
  }
}
