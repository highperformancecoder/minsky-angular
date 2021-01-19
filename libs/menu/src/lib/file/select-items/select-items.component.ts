import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-select-items',
  templateUrl: './select-items.component.html',
  styleUrls: ['./select-items.component.scss'],
})
export class SelectItemsComponent {
  constructor(private electronService: ElectronService) {}

  onClickOk() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
