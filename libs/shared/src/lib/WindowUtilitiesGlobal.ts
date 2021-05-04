interface Offset {
  left: number;
  top: number;
}

abstract class WindowUtilitiesGlobal {
  private static minskyCanvasElement: HTMLElement = null;
  private static minskyCanvasContainer : HTMLElement = null;
  private static leftOffset = 0;
  private static topOffset = 0;
  private static drawableWidth = 0;
  private static drawableHeight = 0;


  private static initializeIfNeeded() {
    if (!this.minskyCanvasElement) {
      const elements = document.getElementsByClassName('minsky-canvas-container');
      if(elements) {
        this.minskyCanvasContainer = elements[0] as HTMLElement;

        this.minskyCanvasElement = document.getElementById('main-minsky-canvas');
        
        this.drawableWidth = this.minskyCanvasContainer.clientWidth;
        this.drawableHeight = this.minskyCanvasContainer.clientHeight;

        // TODO:: Review ---> Canvas dimenstions 10X of container

        this.minskyCanvasElement.style.width = 10*this.drawableWidth + "px";
        this.minskyCanvasElement.style.height = 10*this.drawableHeight + "px";

        const clientRect = this.minskyCanvasContainer.getBoundingClientRect();
        this.leftOffset = Math.ceil(clientRect.left);
        this.topOffset = Math.ceil(clientRect.top);
      }
    }
  }

  public static getMinskyCanvasOffset(): Offset {
    this.initializeIfNeeded();
    return {
      left: this.leftOffset,
      top: this.topOffset,
    };
  }
  
  public static getDrawableArea() {
    this.initializeIfNeeded();
    return {
      width : this.drawableWidth,
      height : this.drawableHeight
    }
  }

  public static getMinskyCanvasElement(): HTMLElement {
    this.initializeIfNeeded();
    return this.minskyCanvasElement;
  }
}

export { WindowUtilitiesGlobal };
