import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';
import * as debug from 'debug';

const logInfo = debug('minsky:web:info');
@Component({
  selector: 'minsky-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  constructor(private electronService: ElectronService) {}

  onClickOk() {
    logInfo('button clicked');
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
