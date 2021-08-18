import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunicationService, ElectronService } from '@minsky/core';
import { commandsMapping, HeaderEvent } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-godley-widget-view',
  templateUrl: './godley-widget-view.component.html',
  styleUrls: ['./godley-widget-view.component.scss'],
})
export class GodleyWidgetViewComponent implements OnInit, OnDestroy {
  headerEvent = 'HEADER_EVENT';

  constructor(
    private communicationService: CommunicationService,
    private electronService: ElectronService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params.itemId;
      this.systemWindowId = params.systemWindowId;
    });
  }
  itemId: number;
  systemWindowId: number;

  leftOffset = 0;
  topOffset: number;
  height: number;
  width: number;
  ngOnInit() {
    const plotCanvasContainer = document.getElementById('godley-cairo-canvas');

    const clientRect = plotCanvasContainer.getBoundingClientRect();

    this.leftOffset = Math.round(clientRect.left);
    this.topOffset = Math.round(clientRect.top);

    this.height = Math.round(plotCanvasContainer.clientHeight);
    this.width = Math.round(plotCanvasContainer.clientWidth);

    if (
      this.electronService.isElectron &&
      this.systemWindowId &&
      this.itemId &&
      this.height &&
      this.width
    ) {
      const command = `${commandsMapping.GET_NAMED_ITEM}/${
        this.itemId
      }/second/popup/renderFrame [${this.systemWindowId},${
        this.leftOffset
      },${45},${this.width},${this.height}]`;
      // TODO:: Remove hardcoding of the number (45) above

      console.log(
        '🚀 ~ file: godley-widget-view.component.ts ~ line 43 ~ GodleyWidgetViewComponent ~ ngOnInit ~ command',
        command
      );
      this.electronService.sendMinskyCommandAndRender({
        command,
      });
    }
  }

  async handleToolbarEvent(event: HeaderEvent) {
    await this.communicationService.sendEvent(this.headerEvent, event);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
