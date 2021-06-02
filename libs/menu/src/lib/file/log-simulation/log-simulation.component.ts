import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-log-simulation',
  templateUrl: './log-simulation.component.html',
  styleUrls: ['./log-simulation.component.scss'],
})
export class LogSimulationComponent {
  constructor(private electronService: ElectronService) {}

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
