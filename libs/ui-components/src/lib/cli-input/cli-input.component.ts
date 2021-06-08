import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ElectronService, StateManagementService } from '@minsky/core';
import { commandsMapping, events, MinskyProcessPayload } from '@minsky/shared';
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
  commands: Array<string>;
  filteredOptions$: Observable<string[]>;
  command: string;
  form: FormGroup;

  public get commandControl(): AbstractControl {
    return this.form.get('command');
  }

  public get argsControl(): AbstractControl {
    return this.form.get('args');
  }

  constructor(
    private electronService: ElectronService,
    public stateManagementService: StateManagementService,
    private changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      command: new FormControl('', Validators.required),
      args: new FormControl(),
    });

    this.filteredOptions$ = this.commandControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );

    this.form.valueChanges.subscribe(() => {
      this.command = this.makeCommand();
    });

    if (this.electronService.isElectron) {
      this.commands = this.electronService.ipcRenderer.sendSync(
        events.ipc.GET_COMMAND_OUTPUT,
        { command: commandsMapping.LIST }
      );

      // (async () => {
      //   // this.commands = await axios.get('http://localhost:4445/minsky/@list');
      //   const res = await axios.get('http://localhost:4445/minsky/@list');
      //   console.log(
      //     '🚀 ~ file: cli-input.component.ts ~ line 72 ~ CliInputComponent ~ res',
      //     res
      //   );
      // })();

      this.stateManagementService.minskyProcessReply$.subscribe(() => {
        this.changeDetectionRef.detectChanges();
      });
    }
  }

  handleSubmit() {
    if (this.command) {
      const payload: MinskyProcessPayload = {
        command: this.command,
      };
      this.electronService.sendMinskyCommandAndRender(payload);
    }
  }

  private makeCommand() {
    return `${this.commandControl.value} ${
      this.argsControl.value || ''
    }`.trim();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.commands.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
