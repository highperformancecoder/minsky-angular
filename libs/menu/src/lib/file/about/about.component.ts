import { Component } from '@angular/core';

@Component({
  selector: 'minsky-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  // constructor(private electronService: ElectronService) {}

  onClickOk() {
    console.log('button clicked');
    // this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}
