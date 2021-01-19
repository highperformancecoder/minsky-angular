import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent {
  constructor(private electronService: ElectronService) {}

  onCancel() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
