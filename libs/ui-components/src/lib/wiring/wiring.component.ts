import {
  AfterContentInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
  selector: 'minsky-wiring',
  templateUrl: './wiring.component.html',
  styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit, OnDestroy, AfterContentInit {
  mouseMove$: Observable<MouseEvent>;
  offsetTop: string;

  showTabs = true;

  constructor(
    public cmService: CommunicationService,
    private electronService: ElectronService,
    private windowUtilityService: WindowUtilityService,
    private zone: NgZone
  ) {}
  ngAfterContentInit() {
    (async () => {
      const availableOperations = (await this.electronService.sendMinskyCommandAndRender(
        {
          command: commandsMapping.AVAILABLE_OPERATIONS,
          render: false,
        }
      )) as string[];
      console.log(
        '🚀 ~ file: wiring.component.ts ~ line 49 ~ ngAfterViewChecked ~ res',
        availableOperations
      );

      await this.electronService.sendMinskyCommandAndRender({
        command: commandsMapping.CANVAS_REQUEST_REDRAW,
      });
    })();
  }

  ngOnInit() {
    const minskyCanvasContainer = this.windowUtilityService.getMinskyContainerElement();
    const minskyCanvasElement = this.windowUtilityService.getMinskyCanvasElement();

    const scrollableArea = this.windowUtilityService.getScrollableArea();

    this.offsetTop = `calc(100vh - ${minskyCanvasContainer.offsetTop}px)`;

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
