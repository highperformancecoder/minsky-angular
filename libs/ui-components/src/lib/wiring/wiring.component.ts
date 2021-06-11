import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
  CommunicationService,
  ElectronService,
  WindowUtilityService,
} from '@minsky/core';
import { availableOperations, commandsMapping, events } from '@minsky/shared';
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

    // this starts the http server when the app starts
    setTimeout(() => {
      this.electronService.ipcRenderer.send(events.AUTO_START_MINSKY_SERVICE);
    }, 1);

    this.zone.runOutsideAngular(() => {
      if (this.electronService.isElectron) {
        const handleScroll = async (scrollTop: number, scrollLeft: number) => {
          const posX = scrollableArea.width / 2 - scrollLeft;
          const posY = scrollableArea.height / 2 - scrollTop;

          await this.electronService.sendMinskyCommandAndRender({
            command: commandsMapping.MOVE_TO,
            mouseX: posX,
            mouseY: posY,
          });
        };

        minskyCanvasContainer.addEventListener('scroll', async () => {
          await handleScroll(
            minskyCanvasContainer.scrollTop,
            minskyCanvasContainer.scrollLeft
          );
        });
        minskyCanvasContainer.onwheel = this.cmService.onMouseWheelZoom;

        minskyCanvasContainer.addEventListener('keydown', async (event) => {
          await this.cmService.handleKeyPress(event);
        });

        this.mouseMove$ = fromEvent<MouseEvent>(
          minskyCanvasElement,
          'mousemove'
        ).pipe(sampleTime(30)); /// FPS=1000/sampleTime

        this.mouseMove$.subscribe(async (event: MouseEvent) => {
          await this.cmService.mouseEvents('CANVAS_EVENT', event);
        });

        minskyCanvasElement.addEventListener(
          'mousedown',
          async (event: MouseEvent) => {
            await this.cmService.mouseEvents('CANVAS_EVENT', event);
          }
        );

        minskyCanvasElement.addEventListener(
          'mouseup',
          async (event: MouseEvent) => {
            await this.cmService.mouseEvents('CANVAS_EVENT', event);
          }
        );
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {}
}
