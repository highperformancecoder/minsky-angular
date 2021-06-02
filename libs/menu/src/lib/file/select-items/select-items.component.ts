import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-select-items',
  templateUrl: './select-items.component.html',
  styleUrls: ['./select-items.component.scss'],
})
export class SelectItemsComponent {
  constructor(private electronService: ElectronService) {}

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
