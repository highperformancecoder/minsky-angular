import { Component, OnInit } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {}
  onCancel() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
