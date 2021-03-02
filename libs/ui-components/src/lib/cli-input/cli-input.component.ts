import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommunicationService } from '@minsky/core';
import { CairoPayload, commands } from '@minsky/shared';

@Component({
  selector: 'minsky-cli-input',
  templateUrl: './cli-input.component.html',
  styleUrls: ['./cli-input.component.scss'],
})
export class CliInputComponent implements OnInit {
  form: FormGroup;
  constructor(private communicationService: CommunicationService) {}
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
    this.communicationService.sendCairoRenderEvent();
  }

  handleSubmit() {
    if (this.command) {
      const payload: CairoPayload = {
        command: this.command,
      };
      this.communicationService.sendCairoEvent(payload);
    }
  }

  private makeCommand() {
    return `${this.form.get('command').value} ${
      this.form.get('args').value || ''
    }`.trim();
  }
}
