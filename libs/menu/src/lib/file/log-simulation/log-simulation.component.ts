import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-log-simulation',
  templateUrl: './log-simulation.component.html',
  styleUrls: ['./log-simulation.component.scss'],
})
export class LogSimulationComponent {
  constructor(private eleService: ElectronService) {}

  onClickOk() {
    this.eleService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
