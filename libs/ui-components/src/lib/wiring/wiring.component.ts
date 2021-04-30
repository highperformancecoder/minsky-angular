import { Component, OnDestroy, OnInit } from '@angular/core';
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
    private electronService: ElectronService
  ) {}

  ngOnInit() {
    const scope = this;
    scope.minskyCanvas = WindowUtilitiesGlobal.getMinskyCanvasElement();
    scope.offsetTop = `calc(100vh - ${scope.minskyCanvas.offsetTop}px)`;

    if (scope.electronService.isElectron) {
      let lastKnownScrollPosition = 0;
      let ticking = false;

      scope.modelX = Number(
        scope.electronService.ipcRenderer.sendSync(
          events.ipc.GET_COMMAND_OUTPUT,
          { command: commandsMapping.X }
        )
      );

      scope.modelY = Number(
        scope.electronService.ipcRenderer.sendSync(
          events.ipc.GET_COMMAND_OUTPUT,
          { command: commandsMapping.Y }
        )
      );

      const handleScroll = (scrollPos) => {
        const offset = WindowUtilitiesGlobal.getMinskyCanvasOffset();
        let newX = scope.modelX - offset.left;
        let newY = scope.modelY - offset.top;
        
        scope.modelX = newX;
        scope.modelY = newY;

        scope.cmService.sendMinskyCommandAndRender({
          command: `${commandsMapping.MOVE_TO} [${newX},${newY}]`,
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
