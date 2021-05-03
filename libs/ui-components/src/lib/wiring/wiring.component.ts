import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CommunicationService,
  ElectronService,
  StateManagementService,
} from '@minsky/core';
import {
  availableOperations,
  commandsMapping,
  events,
  minskyProcessReplyIndicators,
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
  minskyCanvas: HTMLElement;
  mouseMove$: Observable<MouseEvent>;
  offsetTop: string;

  _availableOperations = availableOperations;
  _commandsMapping = commandsMapping;

  t = 0;
  deltaT = 0;

  modelX: number;
  modelY: number;

  constructor(
    public cmService: CommunicationService,
    private electronService: ElectronService,
    private stateManagementService: StateManagementService
  ) {}

  ngOnInit() {
    this.minskyCanvas = WindowUtilitiesGlobal.getMinskyCanvasElement();
    this.offsetTop = `calc(100vh - ${this.minskyCanvas.offsetTop}px)`;

    if (this.electronService.isElectron) {
      let lastKnownScrollPosition = 0;
      let ticking = false;

      (async () => {
        this.modelX = Number(
          await this.stateManagementService.getCommandValue(
            commandsMapping.X,
            minskyProcessReplyIndicators.X
          )
        );

        this.modelY = Number(
          await this.stateManagementService.getCommandValue(
            commandsMapping.Y,
            minskyProcessReplyIndicators.Y
          )
        );
      })();

      const handleScroll = (scrollPos) => {
        const offset = WindowUtilitiesGlobal.getMinskyCanvasOffset();

        this.electronService.sendMinskyCommandAndRender({
          command: `${commandsMapping.MOVE_TO} [${this.modelX - offset.left},${
            this.modelY - offset.top
          }]`,
        });
      };

      this.minskyCanvas.addEventListener('scroll', (e) => {
        lastKnownScrollPosition = window.pageYOffset;

        if (!ticking) {
          window.requestAnimationFrame(function () {
            handleScroll(lastKnownScrollPosition);
            ticking = false;
          });

          ticking = true;
        }
      });
      this.minskyCanvas.onwheel = this.cmService.onMouseWheelZoom;
    }

    this.minskyCanvas.addEventListener('keydown', (event) => {
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
      this.minskyCanvas,
      'mousemove'
    ).pipe(sampleTime(60)); // This is approx 15 fps (having high fps doesn't seem feasible [minsky performance limit] and lower fps will not be smooth)

    this.mouseMove$.subscribe((event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    // this.minskyCanvas.addEventListener('click', (event: MouseEvent) => {
    //   this.cmService.mouseEvents('CANVAS_EVENT', event);
    // });

    this.minskyCanvas.addEventListener('mousedown', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.minskyCanvas.addEventListener('mouseup', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.cmService.dispatchEvents('canvasEvent');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {}
}
