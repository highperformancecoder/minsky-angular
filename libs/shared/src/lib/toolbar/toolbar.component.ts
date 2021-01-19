import { Component } from '@angular/core';
import { CommunicationService } from '@minsky/core';
import { HeaderEvent } from '@minsky/shared';
import * as debug from 'debug';

const logInfo = debug('minsky:web:info');
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
    logInfo('playButton');
  }

  resetButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'RESET_BUTTON',
    });
    logInfo('resetButton');
  }

  stepButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'STEP_BUTTON',
    });
    logInfo('stepbutton');
  }

  simulationSpeed(value) {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'SIMULATION_SPEED',
    });
    logInfo('simulation speed', value);
  }

  zoomOutButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'ZOOMOUT_BUTTON',
    });
    logInfo('zoomOutButton');
  }

  zoomInButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'ZOOMIN_BUTTON',
    });
    logInfo('zoomInButton');
  }

  resetZoomButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'RESETZOOM_BUTTON',
    });
    logInfo('resetZoomButton');
  }

  zoomTofitButton() {
    this.commService.sendEvent(this.HEADER_EVENT, {
      action: 'CLICKED',
      target: 'ZOOMTOFIT_BUTTON',
    });
    logInfo('zoomTofitButton ');
  }
}
