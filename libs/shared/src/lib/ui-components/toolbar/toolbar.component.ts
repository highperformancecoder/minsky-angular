import { Component, EventEmitter, Output } from '@angular/core';
import { HeaderEvent } from '../../interfaces/Interfaces';

@Component({
  selector: 'minsky-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() toolbarEvent = new EventEmitter<HeaderEvent>();

  headerEvent = 'HEADER_EVENT';

  playButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'PLAY',
    });
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
