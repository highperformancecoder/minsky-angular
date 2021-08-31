import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CommunicationService,
  ElectronService,
  WindowUtilityService,
} from '@minsky/core';
import { commandsMapping } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { fromEvent, Observable } from 'rxjs';
import { sampleTime } from 'rxjs/operators';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-godley-widget-view',
  templateUrl: './godley-widget-view.component.html',
  styleUrls: ['./godley-widget-view.component.scss'],
})
export class GodleyWidgetViewComponent implements OnDestroy, AfterViewInit {
  @ViewChild('godleyCanvasElemRef') godleyCanvasElemRef: ElementRef;

  itemId: number;
  systemWindowId: number;
  namedItemSubCommand: string;

  leftOffset = 0;
  topOffset: number;
  height: number;
  width: number;
  godleyCanvasContainer: HTMLElement;
  mouseMove$: Observable<MouseEvent>;

  constructor(
    private communicationService: CommunicationService,
    private windowUtilityService: WindowUtilityService,
    private electronService: ElectronService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params.itemId;
      this.systemWindowId = params.systemWindowId;
    });
  }

  ngAfterViewInit() {
    this.godleyCanvasContainer = this.godleyCanvasElemRef
      .nativeElement as HTMLElement;

    const clientRect = this.godleyCanvasContainer.getBoundingClientRect();

    this.leftOffset = Math.round(clientRect.left);
    this.topOffset = Math.round(
      this.windowUtilityService.getElectronMenuBarHeight()
    );

    this.height = Math.round(this.godleyCanvasContainer.clientHeight);
    this.width = Math.round(this.godleyCanvasContainer.clientWidth);

    this.namedItemSubCommand = `${commandsMapping.GET_NAMED_ITEM}/${this.itemId}/second/popup`;
    this.renderFrame();
    this.initEvents();
  }

  renderFrame() {
    if (
      this.electronService.isElectron &&
      this.systemWindowId &&
      this.itemId &&
      this.height &&
      this.width
    ) {
      const command = `${this.namedItemSubCommand}/renderFrame [${this.systemWindowId},${this.leftOffset},${this.topOffset},${this.width},${this.height}]`;

      this.electronService.sendMinskyCommandAndRender({
        command,
      });
    }
  }

  initEvents() {
    this.mouseMove$ = fromEvent<MouseEvent>(
      this.godleyCanvasContainer,
      'mousemove'
    ).pipe(sampleTime(30)); /// FPS=1000/sampleTime

    this.mouseMove$.subscribe(async (event: MouseEvent) => {
      const { clientX, clientY } = event;
      this.sendMouseEvent(
        clientX,
        clientY,
        commandsMapping.MOUSEMOVE_SUBCOMMAND
      );
      // await this.communicationService.mouseEvents('CANVAS_EVENT', event);
    });

    this.godleyCanvasContainer.addEventListener('mousedown', (event) => {
      const { clientX, clientY } = event;
      this.sendMouseEvent(
        clientX,
        clientY,
        commandsMapping.MOUSEDOWN_SUBCOMMAND
      );
    });

    this.godleyCanvasContainer.addEventListener('mouseup', (event) => {
      const { clientX, clientY } = event;
      this.sendMouseEvent(clientX, clientY, commandsMapping.MOUSEUP_SUBCOMMAND);
    });

    this.godleyCanvasContainer.onwheel = this.onMouseWheelZoom;
  }

  sendMouseEvent(x: number, y: number, type: string) {
    const command = `${this.namedItemSubCommand}/${type} [${x},${y}]`;

    this.electronService.sendMinskyCommandAndRender({
      command,
    });

    //TODO: remove this once the rendering issue is fixed
    this.renderFrame();
  }

  onMouseWheelZoom = async (event: WheelEvent) => {
    event.preventDefault();
    const { deltaY } = event;
    const zoomIn = deltaY < 0;

    const command = `${commandsMapping.GET_NAMED_ITEM}/${this.itemId}/second/popup/zoomFactor`;

    let zoomFactor = (await this.electronService.sendMinskyCommandAndRender({
      command,
    })) as number;

    if (zoomIn) {
      zoomFactor = zoomFactor * 1.1;
    } else {
      zoomFactor = zoomFactor / 1.1;
    }

    //TODO: throttle here if required
    await this.electronService.sendMinskyCommandAndRender({
      command: `${command} ${zoomFactor}`,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
