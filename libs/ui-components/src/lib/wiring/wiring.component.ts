import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CommunicationService,
  ElectronService,
  StateManagementService,
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
  previousScrollTop: number;
  previousScrollLeft: number;

  _availableOperations = availableOperations;
  _commandsMapping = commandsMapping;

  constructor(
    public cmService: CommunicationService,
    private electronService: ElectronService,
    private stateManagementService: StateManagementService,
    private windowUtilityService: WindowUtilityService
  ) {
    this.previousScrollLeft = 0;
    this.previousScrollTop = 0; // TODO:: Reinitialize them whenever new model is loaded
  }

  ngOnInit() {
    const minskyCanvasContainer = this.windowUtilityService.getMinskyContainerElement();
    const minskyCanvasElement = this.windowUtilityService.getMinskyCanvasElement();
    const { top } = this.windowUtilityService.getMinskyCanvasOffset();
    this.offsetTop = `calc(100vh - ${top}px)`;

    if (this.electronService.isElectron) {
      const handleScroll = (scrollTop: number, scrollLeft: number) => {
        const diffX = scrollLeft - this.previousScrollLeft;
        const diffY = scrollTop - this.previousScrollTop;

        const newX = this.stateManagementService.modelX - diffX;
        const newY = this.stateManagementService.modelY - diffY;

        this.electronService.sendMinskyCommandAndRender({
          command: `${commandsMapping.MOVE_TO} [${newX},${newY}]`,
        });
      };

      minskyCanvasContainer.addEventListener('scroll', (e) => {
        handleScroll(
          minskyCanvasContainer.scrollTop,
          minskyCanvasContainer.scrollLeft
        );
      });
      minskyCanvasContainer.onwheel = this.cmService.onMouseWheelZoom;
    }

    minskyCanvasContainer.addEventListener('keydown', async (event) => {
      await this.handleKeyPress(event);
    });

    this.mouseMove$ = fromEvent<MouseEvent>(
      minskyCanvasElement,
      'mousemove'
    ).pipe(sampleTime(60)); // This is approx 15 fps (having high fps doesn't seem feasible [minsky performance limit] and lower fps will not be smooth)

    this.mouseMove$.subscribe((event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    // this.minskyCanvas.addEventListener('click', (event: MouseEvent) => {
    //   this.cmService.mouseEvents('CANVAS_EVENT', event);
    // });

    minskyCanvasElement.addEventListener('mousedown', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    minskyCanvasElement.addEventListener('mouseup', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.cmService.dispatchEvents('canvasEvent');
  }

  private async handleKeyPress(event: KeyboardEvent) {
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
