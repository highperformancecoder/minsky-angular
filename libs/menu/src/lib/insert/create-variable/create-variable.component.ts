import { Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommunicationService, ElectronService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-create-variable',
  templateUrl: './create-variable.component.html',
  styleUrls: ['./create-variable.component.scss'],
})
export class CreateVariableComponent implements OnDestroy {
  type: string;

  form: FormGroup;

  public get variableName(): AbstractControl {
    return this.form.get('variableName');
  }

  constructor(
    private electronService: ElectronService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.type = params.type;
    });

    this.form = new FormGroup({
      variableName: new FormControl('', Validators.required),
      type: new FormControl(this.type, Validators.required),
      value: new FormControl(''),
      units: new FormControl(''),
      rotation: new FormControl(''),
      shortDescription: new FormControl(''),
      detailedDescription: new FormControl(''),
      sliderBoundsMax: new FormControl(''),
      sliderBoundsMin: new FormControl(''),
      sliderStepSize: new FormControl(''),
    });
  }

  createVariable() {
    this.communicationService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ADD_VARIABLE} ["${this.variableName.value}","${this.type}"]`,
    });
    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
