import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'app-dimensions',
  templateUrl: './dimensions.component.html',
  styleUrls: ['./dimensions.component.scss'],
})
export class DimensionsComponent {
  constructor(private electronService: ElectronService) {}

  submitBtn() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
  cancelBtn() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
