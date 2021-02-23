import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@minsky/core';

@Component({
  selector: 'app-wiring',
  templateUrl: './wiring.component.html',
  styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit {
  messageList: string[] = [];
  minskyCanvas: HTMLElement;
  constructor(private cmService: CommunicationService) {}

  ngOnInit() {
    this.minskyCanvas = document.getElementById('offsetValue');

    this.minskyCanvas.addEventListener('click', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.minskyCanvas.addEventListener('mousedown', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.minskyCanvas.addEventListener('mouseup', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.minskyCanvas.addEventListener('mousemove', (event: MouseEvent) => {
      this.cmService.mouseEvents('CANVAS_EVENT', event);
    });

    this.cmService.dispatchEvents('canvasEvent');

    this.cmService.getMessages().subscribe((message: string) => {
      this.messageList.push(message);
    });
  }
}
