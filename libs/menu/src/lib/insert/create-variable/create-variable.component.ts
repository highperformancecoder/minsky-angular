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
  variableType: string;

  form: FormGroup;

  public get variableName(): AbstractControl {
    return this.form.get('variableName');
  }

  public get value(): AbstractControl {
    return this.form.get('value');
  }

  public get units(): AbstractControl {
    return this.form.get('units');
  }

  public get rotation(): AbstractControl {
    return this.form.get('rotation');
  }

  public get type(): AbstractControl {
    return this.form.get('type');
  }

  public get shortDescription(): AbstractControl {
    return this.form.get('shortDescription');
  }

  public get detailedDescription(): AbstractControl {
    return this.form.get('detailedDescription');
  }

  public get sliderBoundsMax(): AbstractControl {
    return this.form.get('sliderBoundsMax');
  }

  public get sliderBoundsMin(): AbstractControl {
    return this.form.get('sliderBoundsMin');
  }

  public get sliderStepSize(): AbstractControl {
    return this.form.get('sliderStepSize');
  }

  // public get sliderStepRel(): AbstractControl {
  //   return this.form.get('sliderStepRel');
  // }

  constructor(
    private electronService: ElectronService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.variableType = params.type;
    });

    this.form = new FormGroup({
      variableName: new FormControl('', Validators.required),
      type: new FormControl(this.variableType, Validators.required),
      value: new FormControl(null),
      units: new FormControl(''),
      rotation: new FormControl(null),
      shortDescription: new FormControl(''),
      detailedDescription: new FormControl(''),
      sliderBoundsMax: new FormControl(null),
      sliderBoundsMin: new FormControl(null),
      sliderStepSize: new FormControl(null),
      // sliderStepRel: new FormControl(false),
    });
  }

  createVariable() {
    this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ADD_VARIABLE} ["${this.variableName.value}","${this.type.value}"]`,
    });

    // if (this.value.value) {
    //   TODO: value;
    //   this.electronService.sendMinskyCommandAndRender({
    //     command: `${commandsMapping.ITEM_FOCUS_INIT_VALUE} ${this.value.value}`,
    //   });
    // }

    if (this.units.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_SET_UNITS} "${this.units.value}"`,
      });
    }

    if (this.rotation.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_ROTATION} ${this.rotation.value}`,
      });
    }

    if (this.shortDescription.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_TOOLTIP} "${this.shortDescription.value}"`,
      });
    }

    if (this.detailedDescription.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_DETAILED_TEXT} "${this.detailedDescription.value}"`,
      });
    }

    if (this.sliderBoundsMax.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_SLIDER_MAX} ${this.sliderBoundsMax.value}`,
      });
    }

    if (this.sliderBoundsMin.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_SLIDER_MIN} ${this.sliderBoundsMin.value}`,
      });
    }

    if (this.sliderStepSize.value) {
      this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.ITEM_FOCUS_SLIDER_STEP} ${this.sliderStepSize.value}`,
      });
    }

    // if (this.sliderStepRel.value) {
    //   this.electronService.sendMinskyCommandAndRender({
    //     command: `${commandsMapping.ITEM_FOCUS_SLIDER_STEP_REL} ${this.sliderStepRel.value}`,
    //   });
    // }

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
