import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-create-variable',
  templateUrl: './create-variable.component.html',
  styleUrls: ['./create-variable.component.scss'],
})
export class CreateVariableComponent {
  constructor(private electronService: ElectronService) {}

  createVariableCancel() {
    console.log('button clicked');
    this.electronService.ipcRenderer.send('create-variable:ok', '');
  }

  createVariableOk() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
