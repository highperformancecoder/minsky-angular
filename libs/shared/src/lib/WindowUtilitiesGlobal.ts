interface Offset {
  left: number;
  top: number;
}

abstract class WindowUtilitiesGlobal {
  private static minskyCanvasElement: HTMLElement = null;
  private static leftOffset = 0;
  private static topOffset = 0;

  private static initializeIfNeeded() {
    if (!this.minskyCanvasElement) {
      this.minskyCanvasElement = document.getElementById('minsky-canvas-container');
    }
  }

  public static getMinskyCanvasOffset(): Offset {
    this.initializeIfNeeded();
    if (this.minskyCanvasElement) {
      const clientRect = this.minskyCanvasElement.getBoundingClientRect();
      this.leftOffset = clientRect.left;
      this.topOffset = clientRect.top;
      // // if (this.leftOffset === null) {
      // // this.minskyCanvasElement.offsetLeft;
      // this.leftOffset =
      //  (window.pageXOffset || this.minskyCanvasElement.scrollLeft) - 
      //   (this.minskyCanvasElement.clientLeft || 0);
      // // }

      // // if (this.topOffset === null) {
      // // this.minskyCanvasElement.offsetTop
      // this.topOffset =
      //   (window.pageYOffset || this.minskyCanvasElement.scrollTop) -
      //   (this.minskyCanvasElement.clientTop || 0);
      // // }
    }
    console.log(this.topOffset, this.leftOffset);
    return {
      left: this.leftOffset,
      top: this.topOffset,
    };
  }

  public static getMinskyCanvasElement(): HTMLElement {
    this.initializeIfNeeded();
    return this.minskyCanvasElement;
  }
}

export { WindowUtilitiesGlobal };
