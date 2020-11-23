import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-godley-table',
  templateUrl: './godley-table.component.html',
  styleUrls: ['./godley-table.component.scss'],
})
export class GodleyTableComponent {
  constructor(private electronService: ElectronService) {}

  godleyTableOk() {
    console.log('button clicked');
    this.electronService.ipcRenderer.send('godley-table:ok', '');
  }
  onCancel() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
