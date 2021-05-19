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
  private containerWidth = 0;
  private containerHeight = 0;
  SCROLLABLE_AREA_FACTOR = 10;

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
        // console.log(
        //   '🚀 ~ file: window-utility.service.ts ~ line 37 ~ WindowUtilityService ~ initializeIfNeeded ~ this.drawableHeight',
        //   this.drawableHeight
        // );

        // TODO:: Review ---> Canvas dimensions 10X of container

        this.containerWidth = this.drawableWidth * this.SCROLLABLE_AREA_FACTOR;
        this.containerHeight =
          this.drawableHeight * this.SCROLLABLE_AREA_FACTOR;

        this.minskyCanvasElement.style.width = this.containerWidth + 'px';
        this.minskyCanvasElement.style.height = this.containerHeight + 'px';

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

  public scrollToCenter() {
    this.initializeIfNeeded();
    this.minskyCanvasElement.scrollTop = this.containerHeight / 2;
    this.minskyCanvasElement.scrollLeft = this.containerWidth / 2;
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

  public getScrollableArea() {
    this.initializeIfNeeded();
    return {
      width: this.containerWidth,
      height: this.containerHeight,
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
