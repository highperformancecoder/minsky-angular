import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommunicationService, ElectronService } from '@minsky/core';
import { CairoPayload, commands } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-cli-input',
  templateUrl: './cli-input.component.html',
  styleUrls: ['./cli-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CliInputComponent implements OnInit, OnDestroy {
  _commands: Array<string>;
  filteredOptions: Observable<string[]>;
  command: string;
  cairoReply: Array<string> = [];
  form: FormGroup;

  constructor(
    public communicationService: CommunicationService,
    private electronService: ElectronService,
    private changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      command: new FormControl('', Validators.required),
      args: new FormControl(),
    });

    this._commands = commands;

    this.filteredOptions = this.form.get('command').valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );

    this.form.valueChanges.subscribe(() => {
      this.command = this.makeCommand();
    });

    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on('cairo-reply', (event, stdout) => {
        this.cairoReply.push(stdout);
        this.changeDetectionRef.detectChanges();
      });
    }
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this._commands.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnDestroy(): void {}
}
