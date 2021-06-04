import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ElectronService, HttpService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-cli-input',
  templateUrl: './cli-input.component.html',
  styleUrls: ['./cli-input.component.scss'],
})
export class CliInputComponent implements OnInit, OnDestroy {
  commands: Array<string>;
  filteredOptions$: Observable<string[]>;
  command: string;
  form: FormGroup;
  output = [];

  public get commandControl(): AbstractControl {
    return this.form.get('command');
  }

  public get argsControl(): AbstractControl {
    return this.form.get('args');
  }

  constructor(
    private electronService: ElectronService,
    public httpService: HttpService
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
      this.httpService
        .handleMinskyCommand(commandsMapping.LIST_V2)
        .subscribe((commands: string[]) => {
          this.commands = commands.map((c) => `/minsky${c}`);
        });
    }
  }

  handleSubmit() {
    if (this.electronService.isElectron && this.command) {
      this.httpService.handleMinskyCommand(this.command).subscribe((output) => {
        this.output.push(`${this.command} ==> ${JSON.stringify(output)}`);
      });
    }
  }

  private makeCommand() {
    return `${this.commandControl.value} ${
      this.argsControl.value || ''
    }`.trim();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.commands?.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
