import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { ClassType, commandsMapping } from '@minsky/shared';

@Component({
  selector: 'minsky-edit-integral',
  templateUrl: './edit-integral.component.html',
  styleUrls: ['./edit-integral.component.scss'],
})
export class EditIntegralComponent implements OnInit {
  form: FormGroup;

  classType: ClassType;
  itemName: string;

  public get name(): AbstractControl {
    return this.form.get('name');
  }

  public get initialValue(): AbstractControl {
    return this.form.get('initialValue');
  }
  public get units(): AbstractControl {
    return this.form.get('units');
  }
  public get rotation(): AbstractControl {
    return this.form.get('rotation');
  }
  public get relative(): AbstractControl {
    return this.form.get('relative');
  }

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute
  ) {
    this.form = new FormGroup({
      name: new FormControl(''),
      initialValue: new FormControl(''),
      units: new FormControl(''),
      rotation: new FormControl(0),
      relative: new FormControl(false),
    });
    this.route.queryParams.subscribe((params) => {
      this.classType = params.classType;
    });
  }

  ngOnInit() {
    if (this.electronService.isElectron) {
      (async () => {
        await this.updateFormValues();
      })();
    }
  }

  private async updateFormValues() {
    const name = (await this.electronService.sendMinskyCommandAndRender({
      render: false,
      command: commandsMapping.CANVAS_ITEM_DESCRIPTION,
    })) as string;

    this.itemName = name;
    this.name.setValue(name);

    const rotation = await this.electronService.sendMinskyCommandAndRender({
      render: false,
      command: commandsMapping.CANVAS_ITEM_ROTATION,
    });
    this.rotation.setValue(rotation);

    // TODO:
    // const initialValue = await this.electronService.sendMinskyCommandAndRender({
    //   render: false,
    //   command: '/intVar/init',
    // });

    // const units = await this.electronService.sendMinskyCommandAndRender({
    //   render: false,
    //   command: '[$item.intVar.unitsStr]',
    // });

    // const relative = await this.electronService.sendMinskyCommandAndRender({
    //   render: false,
    //   command: '',
    // });
  }

  async handleSave() {
    if (this.electronService.isElectron) {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.CANVAS_ITEM_DESCRIPTION} "${this.name.value}"`,
      });

      await this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.CANVAS_ITEM_ROTATION} ${this.rotation.value}`,
      });

      // TODO:
      // await this.electronService.sendMinskyCommandAndRender({
      //   command: `${commandsMapping.CANVAS_ITEM_ROTATION} ${this.rotation.value}`,
      // });

      // await this.electronService.sendMinskyCommandAndRender({
      //   command: `${commandsMapping.CANVAS_ITEM_ROTATION} ${this.rotation.value}`,
      // });

      // await this.electronService.sendMinskyCommandAndRender({
      //   command: `${commandsMapping.CANVAS_ITEM_ROTATION} ${this.rotation.value}`,
      // });
    }

    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
