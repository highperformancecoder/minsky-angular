import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
  CommunicationService,
  ElectronService,
  WindowUtilityService,
} from '@minsky/core';
import {
  availableOperations,
  commandsMapping,
  events,
  MinskyProcessPayload,
} from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { fromEvent, Observable } from 'rxjs';
import { sampleTime } from 'rxjs/operators';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-wiring',
  templateUrl: './wiring.component.html',
  styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit, OnDestroy {
  mouseMove$: Observable<MouseEvent>;
  offsetTop: string;

  _availableOperations = availableOperations;
  _commandsMapping = commandsMapping;

  constructor(
    public cmService: CommunicationService,
    private electronService: ElectronService,
    private windowUtilityService: WindowUtilityService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const minskyCanvasContainer = this.windowUtilityService.getMinskyContainerElement();
    const minskyCanvasElement = this.windowUtilityService.getMinskyCanvasElement();

    const scrollableArea = this.windowUtilityService.getScrollableArea();

    this.offsetTop = `calc(100vh - ${minskyCanvasContainer.offsetTop}px)`;

    this.zone.runOutsideAngular(() => {
      if (this.electronService.isElectron) {
        const handleScroll = (scrollTop: number, scrollLeft: number) => {
          const posX = scrollableArea.width / 2 - scrollLeft;
          const posY = scrollableArea.height / 2 - scrollTop;

          this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.MOVE_TO,
            mouseX: posX,
            mouseY: posY,
          });
        };

        minskyCanvasContainer.addEventListener('scroll', () => {
          handleScroll(
            minskyCanvasContainer.scrollTop,
            minskyCanvasContainer.scrollLeft
          );
        });
        minskyCanvasContainer.onwheel = this.cmService.onMouseWheelZoom;

        minskyCanvasContainer.addEventListener('keydown', (event) => {
          this.handleKeyPress(event);
        });

        this.mouseMove$ = fromEvent<MouseEvent>(
          minskyCanvasElement,
          'mousemove'
        ).pipe(sampleTime(30)); /// FPS=1000/sampleTime

        this.mouseMove$.subscribe((event: MouseEvent) => {
          this.cmService.mouseEvents('CANVAS_EVENT', event);
        });

        // this.mouseMove$ = fromEvent<MouseEvent>(
        //   minskyCanvasElement,
        //   'mousemove'
        // ).pipe(
        //   sampleTime(30),
        //   pairwise(),
        //   map(([a, b]) => ({
        //     event: b,
        //     ignore: a.x == b.x && a.y == b.y,
        //   })),
        //   filter((e) => !e.ignore)
        // );
        // this.mouseMove$.subscribe((e) => {
        //   this.cmService.mouseEvents('CANVAS_EVENT', e.event as MouseEvent);
        // });

        minskyCanvasElement.addEventListener(
          'mousedown',
          (event: MouseEvent) => {
            this.cmService.mouseEvents('CANVAS_EVENT', event);
          }
        );

        minskyCanvasElement.addEventListener('mouseup', (event: MouseEvent) => {
          this.cmService.mouseEvents('CANVAS_EVENT', event);
        });
      }

      // this.cmService.dispatchEvents('canvasEvent');
    });
  }

  private handleKeyPress(event: KeyboardEvent) {
    const payload: MinskyProcessPayload = {
      command: commandsMapping.KEY_PRESS,
      key: event.key,
      shift: event.shiftKey,
      capsLock: event.getModifierState('CapsLock'),
      ctrl: event.ctrlKey,
      alt: event.altKey,
      mouseX: this.cmService.mouseX,
      mouseY: this.cmService.mouseY,
    };

    console.table(payload);

    this.electronService.sendMinskyCommandAndRender(
      payload,
      events.ipc.KEY_PRESS
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {}
}
