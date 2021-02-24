import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ElectronService } from '@minsky/core';
import { CairoPayload } from '@minsky/shared';

@Component({
  selector: 'minsky-cli-input',
  templateUrl: './cli-input.component.html',
  styleUrls: ['./cli-input.component.scss'],
})
export class CliInputComponent implements OnInit {
  form: AbstractControl;
  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.form = new FormControl();

    this.form.valueChanges.subscribe((v) => {
      console.log(v);
    });
  }

  render() {
    if (this.electronService.isElectron) {
      const payload: CairoPayload = {
        command: '/minsky/canvas/renderFrame',
      };
      this.electronService.ipcRenderer.send('cairo', payload);
    }
  }

  handleSubmit() {
    if (this.electronService.isElectron) {
      const payload: CairoPayload = {
        command: this.form.value,
      };
      this.electronService.ipcRenderer.send('cairo', payload);
    }
  }
}
