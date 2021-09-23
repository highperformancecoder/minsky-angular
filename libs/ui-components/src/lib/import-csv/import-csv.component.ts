import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { dateTimeFormats } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-import-csv',
  templateUrl: './import-csv.component.html',
  styleUrls: ['./import-csv.component.scss'],
})
export class ImportCsvComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasElemRef') canvasElemRef: ElementRef;
  canvasContainer: HTMLElement;

  form: FormGroup;

  itemId: number;
  systemWindowId: number;
  valueId: number;
  variableValuesSubCommand: string;

  leftOffset = 0;
  topOffset: number;
  height: number;
  width: number;

  mouseMove$: Observable<MouseEvent>;

  timeFormatStrings = dateTimeFormats;
  mouseY: number;
  mouseX: number;

  CSVLines: Array<Array<string>> = [];

  public get url(): AbstractControl {
    return this.form.get('url');
  }
  public get columnar(): AbstractControl {
    return this.form.get('columnar');
  }
  public get separator(): AbstractControl {
    return this.form.get('separator');
  }
  public get decimalSeparator(): AbstractControl {
    return this.form.get('decimalSeparator');
  }
  public get escape(): AbstractControl {
    return this.form.get('escape');
  }
  public get quote(): AbstractControl {
    return this.form.get('quote');
  }
  public get mergeDelimiters(): AbstractControl {
    return this.form.get('mergeDelimiters');
  }
  public get missingValue(): AbstractControl {
    return this.form.get('missingValue');
  }
  public get columnWidth(): AbstractControl {
    return this.form.get('columnWidth');
  }
  public get duplicateKeyAction(): AbstractControl {
    return this.form.get('duplicateKeyAction');
  }
  public get horizontalDimension(): AbstractControl {
    return this.form.get('horizontalDimension');
  }
  public get type(): AbstractControl {
    return this.form.get('type');
  }
  public get format(): AbstractControl {
    return this.form.get('format');
  }

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params.itemId;
      this.systemWindowId = params.systemWindowId;
    });

    this.form = new FormGroup({
      url: new FormControl(''),
      columnar: new FormControl(false),
      separator: new FormControl(','),
      decimalSeparator: new FormControl('.'),
      escape: new FormControl(''),
      quote: new FormControl('"'),
      mergeDelimiters: new FormControl(false),
      missingValue: new FormControl('nan'),
      columnWidth: new FormControl(50),
      duplicateKeyAction: new FormControl('throwException'),
      horizontalDimension: new FormControl('?'),
      type: new FormControl('string'),
      format: new FormControl(''),
    });
  }

  ngOnInit() {
    this.updateColumnar();
    this.updateSeparator();
    this.updateDecimalSeparator();
    this.updateEscape();
    this.updateQuote();
    this.updateMergeDelimiters();
    this.updateMissingValue();
    this.updateColumnWidth();
    this.updateDuplicateKeyAction();
    this.updateHorizontalDimension();
    this.updateType();
    this.updateFormat();
  }

  ngAfterViewInit() {
    this.canvasContainer = this.canvasElemRef.nativeElement;

    const clientRect = this.canvasContainer.getBoundingClientRect();

    this.leftOffset = Math.round(clientRect.left);
    this.topOffset = 200;

    this.height = Math.round(this.canvasContainer.clientHeight);
    this.width = Math.round(this.canvasContainer.clientWidth);

    (async () => {
      this.valueId = await this.getValueId();
      this.variableValuesSubCommand = `/minsky/variableValues/@elem/${this.valueId}/second`;
    })();
  }

  async getValueId() {
    const command = `/minsky/namedItems/@elem/${this.itemId}/second/valueId`;

    const valueId = (await this.electronService.sendMinskyCommandAndRender({
      command,
    })) as number;

    return valueId;
  }

  async selectFile() {
    const fileDialog = await this.electronService.remote.dialog.showOpenDialog({
      filters: [
        { extensions: ['csv'], name: 'CSV' },
        { extensions: ['*'], name: 'All Files' },
      ],
    });

    if (fileDialog.canceled || !fileDialog.filePaths) {
      return;
    }

    const filePath = normalizeFilePathForPlatform(
      fileDialog.filePaths[0].toString()
    );

    this.url.setValue(filePath);
  }

  async load() {
    const fileUrlOnServer = (await this.electronService.sendMinskyCommandAndRender(
      {
        command: `${this.variableValuesSubCommand}/csvDialog/url`,
      }
    )) as string;

    const fileUrl = this.url.value;

    if (fileUrl !== fileUrlOnServer) {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/url "${fileUrl}"`,
      });

      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/guessSpecAndLoadFile`,
      });
    } else {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/loadFile`,
      });
    }

    await this.parseLines();
    // await this.redraw();
  }

  async parseLines() {
    this.CSVLines = (await this.electronService.sendMinskyCommandAndRender({
      command: `${this.variableValuesSubCommand}/csvDialog/parseLines`,
    })) as Array<Array<string>>;
  }

  updateColumnar() {
    this.columnar.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/columnar ${v}`,
      });

      // await this.redraw();
    });
  }

  updateSeparator() {
    this.separator.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/separator "${v}"`,
      });
    });
  }

  updateDecimalSeparator() {
    this.decimalSeparator.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/decSeparator "${v}"`,
      });
    });
  }

  updateEscape() {
    this.escape.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/escape "${v}"`,
      });
    });
  }

  updateQuote() {
    this.quote.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/quote "${v}"`,
      });
    });
  }

  updateMergeDelimiters() {
    this.mergeDelimiters.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/mergeDelimiters ${v}`,
      });
    });
  }
  updateMissingValue() {
    this.missingValue.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/missingValue "${v}"`,
      });
    });
  }

  updateColumnWidth() {
    this.columnWidth.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/colWidth ${v}`,
      });

      // await this.redraw();
    });
  }

  updateDuplicateKeyAction() {
    this.duplicateKeyAction.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/duplicateKeyAction "${v}"`,
      });
    });
  }

  updateHorizontalDimension() {
    this.horizontalDimension.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/horizontalDimension "${v}"`,
      });
    });
  }
  updateType() {
    this.type.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/horizontalDimension/type "${v}"`,
      });
    });
  }

  updateFormat() {
    this.format.valueChanges.subscribe(async (v) => {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${this.variableValuesSubCommand}/csvDialog/spec/horizontalDimension/units "${v}"`,
      });
    });
  }

  handleSubmit() {
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
