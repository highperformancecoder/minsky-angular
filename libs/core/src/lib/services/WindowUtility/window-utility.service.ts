import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';

interface Offset {
  left: number;
  top: number;
  electronTop: number;
}

@Injectable({
  providedIn: 'root',
})
export class WindowUtilityService {
  private minskyCanvasElement: HTMLElement = null;
  private minskyCanvasContainer: HTMLElement = null;
  private leftOffset = 0;
  private topOffset = 0;
  private electronTopOffset = 0;
  private drawableWidth = 0;
  private drawableHeight = 0;

  constructor(private electronService: ElectronService) {}

  private initializeIfNeeded() {
    if (!this.minskyCanvasElement) {
      this.minskyCanvasContainer = document.getElementById(
        'minsky-canvas-container'
      );

      if (this.minskyCanvasContainer) {
        this.minskyCanvasElement = document.getElementById(
          'main-minsky-canvas'
        );

        this.drawableWidth = this.minskyCanvasContainer.clientWidth;
        this.drawableHeight = this.minskyCanvasContainer.clientHeight;
        console.log(
          '🚀 ~ file: window-utility.service.ts ~ line 37 ~ WindowUtilityService ~ initializeIfNeeded ~ this.drawableHeight',
          this.drawableHeight
        );

        // TODO:: Review ---> Canvas dimenstions 10X of container

        this.minskyCanvasElement.style.width = 10 * this.drawableWidth + 'px';
        this.minskyCanvasElement.style.height = 10 * this.drawableHeight + 'px';

        const clientRect = this.minskyCanvasContainer.getBoundingClientRect();

        this.leftOffset = Math.ceil(clientRect.left);
        this.topOffset = Math.ceil(clientRect.top);

        const currentWindow = this.electronService.remote.getCurrentWindow();
        const currentWindowSize = currentWindow.getSize()[1];
        const currentWindowContentSize = currentWindow.getContentSize()[1];
        const electronMenuBarHeight =
          currentWindowSize - currentWindowContentSize;

        this.electronTopOffset = this.topOffset + electronMenuBarHeight;
      }
    }
  }

  public getMinskyCanvasOffset(): Offset {
    this.initializeIfNeeded();

    return {
      left: this.leftOffset,
      top: this.topOffset,
      electronTop: this.electronTopOffset,
    };
  }

  public getDrawableArea() {
    this.initializeIfNeeded();

    return {
      width: this.drawableWidth,
      height: this.drawableHeight,
    };
  }

  public getMinskyCanvasElement(): HTMLElement {
    this.initializeIfNeeded();

    return this.minskyCanvasElement;
  }

  public getMinskyContainerElement(): HTMLElement {
    this.initializeIfNeeded();

    return this.minskyCanvasContainer;
  }
}
