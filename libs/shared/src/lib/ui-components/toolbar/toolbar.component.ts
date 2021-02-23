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
      target: 'PLAY_BUTTON',
    });
  }

  resetButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'RESET_BUTTON',
    });
  }

  stepButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'STEP_BUTTON',
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
      target: 'ZOOMOUT_BUTTON',
    });
  }

  zoomInButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOMIN_BUTTON',
    });
  }

  resetZoomButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'RESETZOOM_BUTTON',
    });
  }

  zoomToFitButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOMTOFIT_BUTTON',
    });
  }
}
