import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';
import { HeaderEvent } from '@minsky/shared';

@Component({
  selector: 'minsky-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  HEADER_EVENT: HeaderEvent;
  constructor(private commService: CommunicationService) {}

  playButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'PLAY_BUTTON',
    });
    console.log('playButton');
  }

  resetButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'RESET_BUTTON',
    });
    console.log('resetButton');
  }

  stepButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'STEP_BUTTON',
    });
    console.log('stepbutton');
  }

  simulationSpeed(value) {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'SIMULATION_SPEED',
    });
    console.log('simulation speed', value);
  }

  zoomOutButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'ZOOMOUT_BUTTON',
    });
    console.log('zoomOutButton');
  }

  zoomInButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'ZOOMIN_BUTTON',
    });
    console.log('zoomInButton');
  }

  resetZoomButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'RESETZOOM_BUTTON',
    });
    console.log('resetZoomButton');
  }

  zoomTofitButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'ZOOMTOFIT_BUTTON',
    });
    console.log('zoomTofitButton ');
  }
}
