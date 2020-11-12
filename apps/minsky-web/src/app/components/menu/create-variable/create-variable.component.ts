import { Component, OnInit } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'app-create-variable',
  templateUrl: './create-variable.component.html',
  styleUrls: ['./create-variable.component.scss'],
})
export class CreateVariableComponent implements OnInit {
  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {}

  createVariableCancel() {
    console.log('button clicked');
    this.electronService.ipcRenderer.send('create-variable:ok', '');
  }

  createVariableOk() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
