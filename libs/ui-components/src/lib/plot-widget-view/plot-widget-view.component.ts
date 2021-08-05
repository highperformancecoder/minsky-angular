import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { commandsMapping, events } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-plot-widget-view',
  templateUrl: './plot-widget-view.component.html',
  styleUrls: ['./plot-widget-view.component.scss'],
})
export class PlotWidgetViewComponent implements OnInit, OnDestroy {
  itemId: number;
  systemWindowId: number;

  leftOffset = 0;
  topOffset: number;
  height: number;
  width: number;

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params.itemId;
      this.systemWindowId = params.systemWindowId;
    });
  }

  ngOnInit() {
    const plotCanvasContainer = document.getElementById('plot-cairo-canvas');

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
      }/second/renderFrame [${this.systemWindowId},${this.leftOffset},${22},${
        this.width
      },${this.height}]`;

      this.electronService.sendMinskyCommandAndRender({
        command,
      });
    }
  }

  openOptionsWindow() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.CREATE_MENU_POPUP, {
        title: 'Plot Window Options',
        url: `#/headless/plot-widget-options?itemId=${this.itemId}`,
        uid: this.itemId,
        height: 500,
        width: 500,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
