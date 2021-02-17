import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommunicationService, ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-cairo',
  templateUrl: './cairo.component.html',
  styleUrls: ['./cairo.component.scss'],
})
export class CairoComponent implements OnInit {
  input: FormControl;

  constructor(
    private electronService: ElectronService,
    private communicationService: CommunicationService
  ) {
    this.input = new FormControl('');
  }

  ngOnInit() {
    if (this.electronService.isElectron) {
      this.input.valueChanges.subscribe((txt) => {
        this.electronService.ipcRenderer.send('cairo', {
          txt,
          top: this.communicationService.topOffset,
          left: this.communicationService.leftOffset,
          height: this.communicationService.windowHeight,
          width: this.communicationService.windowWidth,
        });
      });
    }
  }
}
