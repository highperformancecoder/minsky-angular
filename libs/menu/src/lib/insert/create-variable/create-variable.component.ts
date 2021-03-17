import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';
import * as debug from 'debug';

const logInfo = debug('minsky:web:info');
@Component({
  selector: 'minsky-create-variable',
  templateUrl: './create-variable.component.html',
  styleUrls: ['./create-variable.component.scss'],
})
export class CreateVariableComponent {
  constructor(private electronService: ElectronService) {}

  createVariableOk() {
    this.electronService.ipcRenderer.send('create-variable:ok', '');
  }
}
