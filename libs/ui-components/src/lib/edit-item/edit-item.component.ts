import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { ClassType } from '@minsky/shared';

@Component({
  selector: 'minsky-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss'],
})
export class EditItemComponent implements OnInit {
  form: FormGroup;

  classType: ClassType;
  itemType: string;

  public get name(): AbstractControl {
    return this.form.get('name');
  }

  public get initialValue(): AbstractControl {
    return this.form.get('initialValue');
  }
  public get units(): AbstractControl {
    return this.form.get('units');
  }
  public get axis(): AbstractControl {
    return this.form.get('axis');
  }
  public get argument(): AbstractControl {
    return this.form.get('argument');
  }
  public get rotation(): AbstractControl {
    return this.form.get('rotation');
  }
  public get expression(): AbstractControl {
    return this.form.get('expression');
  }
  public get relative(): AbstractControl {
    return this.form.get('relative');
  }

  public get isUserFunction(): boolean {
    return this.classType === ClassType.UserFunction;
  }

  public get isIntegral(): boolean {
    return this.classType === ClassType.IntOp;
  }

  public get isOperation(): boolean {
    return this.classType === ClassType.Operation;
  }

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.form = new FormGroup({
      name: new FormControl(''),
      initialValue: new FormControl(''),
      units: new FormControl(''),
      axis: new FormControl(''),
      argument: new FormControl(''),
      rotation: new FormControl(0),
      expression: new FormControl(''),
      relative: new FormControl(false),
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.classType = params.classType;
      this.itemType = params.type;

      this.changeDetectorRef.detectChanges();
    });
  }

  async handleSave() {
    if (this.electronService.isElectron) {
      // this.closeWindow();
    }
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
