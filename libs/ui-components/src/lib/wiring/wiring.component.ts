import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommunicationService, ElectronService } from '@minsky/core';
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
  minskyCanvas: HTMLElement;

  mouseMove$: Observable<MouseEvent>;

  _availableOperations = availableOperations;
  _commandsMapping = commandsMapping;

  t = 0;
  deltaT = 0;

  offsetTop: string;

  constructor(
    public cmService: CommunicationService,
    private electronService: ElectronService
  ) {}

  ngOnInit() {
    this.minskyCanvas = document.getElementById('canvas');

    this.offsetTop = `calc(100vh - ${this.minskyCanvas.offsetTop}px)`;
    if (this.electronService.isElectron) {
      //

      // TODO: fix the scroll implementation once 'minsky/model/x' and '/minsky/model/y' commands are fixed

      let lastKnownScrollPosition = 0;
      let ticking = false;

      const doSomething = (scrollPos) => {
        const left =
          (window.pageXOffset || this.minskyCanvas.scrollLeft) -
          (this.minskyCanvas.clientLeft || 0);
        /* console.log(
          '🚀 ~ file: wiring.component.ts ~ line 50 ~ WiringComponent ~ this.minskyCanvas.addEventListener ~ left',
          left
        ); */
        const top =
          (window.pageYOffset || this.minskyCanvas.scrollTop) -
          (this.minskyCanvas.clientTop || 0);
        /* console.log(
          '🚀 ~ file: wiring.component.ts ~ line 53 ~ WiringComponent ~ this.minskyCanvas.addEventListener ~ top',
          top
        ); */

        this.cmService.sendMinskyCommandAndRender({
          command: `${commandsMapping.X} ${left}`,
        });

        this.cmService.sendMinskyCommandAndRender({
          command: `${commandsMapping.Y} ${top}`,
        });
      };

      this.minskyCanvas.addEventListener('scroll', (e) => {
        lastKnownScrollPosition = window.pageYOffset;

        if (!ticking) {
          window.requestAnimationFrame(function () {
            doSomething(lastKnownScrollPosition);
            ticking = false;
          });

          ticking = true;
        }
      });

      //

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
    ).pipe(sampleTime(60));

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
