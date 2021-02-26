import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '@minsky/core';
import { CairoPayload, commands } from '@minsky/shared';

@Component({
  selector: 'minsky-cli-input',
  templateUrl: './cli-input.component.html',
  styleUrls: ['./cli-input.component.scss'],
})
export class CliInputComponent implements OnInit {
  form: FormGroup;
  constructor(private electronService: ElectronService) {}
  _commands: Array<string>;
  command: string;

  ngOnInit(): void {
    this.form = new FormGroup({
      command: new FormControl('', Validators.required),
      args: new FormControl(),
    });

    this._commands = commands;

    this.form.valueChanges.subscribe((v) => {
      this.command = this.makeCommand();
    });
  }

  isSubmitDisabled() {
    return !this.form.get('command').value;
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
      if (this.command) {
        const payload: CairoPayload = {
          command: this.command,
        };
        this.electronService.ipcRenderer.send('cairo', payload);
      }
    }
  }

  private makeCommand() {
    return `${this.form.get('command').value} ${
      this.form.get('args').value || ''
    }`.trim();
  }
}
