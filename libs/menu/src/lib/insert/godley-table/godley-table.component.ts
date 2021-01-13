import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';
import * as debug from 'debug';

const logInfo = debug('minsky:web:info');
@Component({
  selector: 'minsky-godley-table',
  templateUrl: './godley-table.component.html',
  styleUrls: ['./godley-table.component.scss'],
})
export class GodleyTableComponent {
  constructor(private electronService: ElectronService) {}

  godleyTableOk() {
    logInfo('button clicked');
    this.electronService.ipcRenderer.send('godley-table:ok', '');
  }
  onCancel() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
