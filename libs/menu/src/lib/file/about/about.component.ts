import { Component, OnInit, VERSION } from '@angular/core';
import { ElectronService, StateManagementService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';

@Component({
  selector: 'minsky-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  angularVersion = VERSION.full;
  ecolabVersion: string;
  minskyVersion: string;
  ravelVersion: string;

  constructor(
    private electronService: ElectronService,
    private stateManagementService: StateManagementService
  ) {}

  ngOnInit(): void {
    (async () => {
      this.ecolabVersion = (
        await this.stateManagementService.getCommandValue({
          command: commandsMapping.ECOLAB_VERSION,
        })
      ).slice(1, -1);

      this.ravelVersion = (
        await this.stateManagementService.getCommandValue({
          command: commandsMapping.RAVEL_VERSION,
        })
      ).slice(1, -1);

      this.minskyVersion = (
        await this.stateManagementService.getCommandValue({
          command: commandsMapping.MINSKY_VERSION,
        })
      ).slice(1, -1);
    })();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
