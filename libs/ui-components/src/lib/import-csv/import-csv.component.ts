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
import { commandsMapping } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

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
  namedItemSubCommand: string;

  leftOffset = 0;
  topOffset: number;
  height: number;
  width: number;
  // mouseMove$: Observable<MouseEvent>;

  public get url(): AbstractControl {
    return this.form.get('url');
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

  ngOnInit() {}

  ngAfterViewInit() {
    this.canvasContainer = this.canvasElemRef.nativeElement;

    const clientRect = this.canvasContainer.getBoundingClientRect();
    console.log(
      '🚀 ~ file: import-csv.component.ts ~ line 73 ~ ImportCsvComponent ~ ngAfterViewInit ~ clientRect',
      clientRect
    );

    this.leftOffset = Math.round(clientRect.left);
    this.topOffset = Math.round(clientRect.top);
    console.log(
      '🚀 ~ file: import-csv.component.ts ~ line 76 ~ ImportCsvComponent ~ ngAfterViewInit ~ this.topOffset',
      this.topOffset
    );

    this.height = Math.round(this.canvasContainer.clientHeight);
    this.width = Math.round(this.canvasContainer.clientWidth);

    this.namedItemSubCommand = `${commandsMapping.GET_NAMED_ITEM}/${this.itemId}/second/popup`;

    (async () => {
      await this.renderFrame();
    })();
    // this.initEvents();
  }

  async getValueId() {
    const command = `/minsky/namedItems/@elem/${this.itemId}/second/valueId`;

    const valueId = await this.electronService.sendMinskyCommandAndRender({
      command,
    });

    return valueId;
  }

  async renderFrame() {
    if (
      this.electronService.isElectron &&
      this.systemWindowId &&
      this.itemId &&
      this.height &&
      this.width
    ) {
      const valueId = await this.getValueId();
      const command = `/minsky/variableValues/@elem/${valueId}/second/csvDialog/renderFrame [${
        this.systemWindowId
      },${this.leftOffset},${110},${this.width},${this.height - 25}]`;

      await this.electronService.sendMinskyCommandAndRender({
        command,
      });
    }
  }

  // initEvents() {}

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

    const filePath = fileDialog.filePaths[0].toString();

    this.url.setValue(filePath);
  }

  load() {
    console.log(
      '🚀 ~ file: import-csv.component.ts ~ line 61 ~ ImportCsvComponent ~ load'
    );
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
