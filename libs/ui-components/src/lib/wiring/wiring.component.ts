import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommunicationService, ElectronService } from '@minsky/core';
import { availableOperations, commandsMapping } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { fromEvent, Observable } from 'rxjs';
import { sampleTime } from 'rxjs/operators';

@AutoUnsubscribe()
@Component({
  selector: 'app-wiring',
  templateUrl: './wiring.component.html',
  styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit, OnDestroy {
  minskyCanvas: HTMLElement;

  mouseMove$: Observable<MouseEvent>;

  _availableOperations = availableOperations;
  _commandsMapping = commandsMapping;

  constructor(
    private cmService: CommunicationService,
    private electronService: ElectronService
  ) {}

  ngOnInit() {
    this.minskyCanvas = document.getElementById('offsetValue');

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

  insertElement(command) {
    if (this.electronService.isElectron) {
      this.cmService.sendMinskyCommand({
        command: commandsMapping[command],
      });
    }
  }

  addOperation(arg) {
    if (this.electronService.isElectron) {
      this.cmService.sendMinskyCommand({
        command: `${commandsMapping.ADD_OPERATION} "${arg}"`,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnDestroy(): void {}
}
