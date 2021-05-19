import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommunicationService, ElectronService } from '@minsky/core';
import {
  availableOperations,
  commandsMapping,
  events,
  WindowUtilitiesGlobal,
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
  mouseMove$: Observable<any>;
  offsetTop: string;

  _availableOperations = availableOperations;
  _commandsMapping = commandsMapping;

  constructor(
    public cmService: CommunicationService,
    private electronService: ElectronService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const minskyCanvasContainer = WindowUtilitiesGlobal.getMinskyContainerElement();
    const minskyCanvasElement = WindowUtilitiesGlobal.getMinskyCanvasElement();

    const scrollableArea = WindowUtilitiesGlobal.getScrollableArea();

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
          this.electronService.ipcRenderer.send(events.ipc.KEY_PRESS, {
            key: event.key,
            shift: event.shiftKey,
            capsLock: event.getModifierState('CapsLock'),
            ctrl: event.ctrlKey,
            alt: event.altKey,
            mouseX: this.cmService.mouseX,
            mouseY: this.cmService.mouseY,
          });
        });

        this.mouseMove$ = fromEvent<MouseEvent>(
          minskyCanvasElement,
          'mousemove'
        ).pipe(sampleTime(30)); /// FPS=1000/sampleTime

        this.mouseMove$.subscribe((e) => {
          this.cmService.mouseEvents('CANVAS_EVENT', e as MouseEvent);
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

        // this.minskyCanvas.addEventListener('click', (event: MouseEvent) => {
        //   this.cmService.mouseEvents('CANVAS_EVENT', event);
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {}
}
