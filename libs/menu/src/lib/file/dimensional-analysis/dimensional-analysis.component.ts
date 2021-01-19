import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-dimensional-analysis',
  templateUrl: './dimensional-analysis.component.html',
  styleUrls: ['./dimensional-analysis.component.scss'],
})
export class DimensionalAnalysisComponent {
  constructor(private electronService: ElectronService) {}

  onClick() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
