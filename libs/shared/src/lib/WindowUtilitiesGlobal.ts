interface Offset {
  left: number;
  top: number;
}

const SCROLLABLE_AREA_FACTOR = 10;

abstract class WindowUtilitiesGlobal {
  private static minskyCanvasElement: HTMLElement = null;
  private static minskyCanvasContainer : HTMLElement = null;
  private static leftOffset = 0;
  private static topOffset = 0;
  private static drawableWidth = 0;
  private static drawableHeight = 0;
  private static containerWidth = 0;
  private static containerHeight = 0;



  private static initializeIfNeeded() {
    if (!this.minskyCanvasElement) {
      const elements = document.getElementsByClassName('minsky-canvas-container');
      if(elements) {
        this.minskyCanvasContainer = elements[0] as HTMLElement;

        this.minskyCanvasElement = document.getElementById('main-minsky-canvas');
        
        this.drawableWidth = this.minskyCanvasContainer.clientWidth;
        this.drawableHeight = this.minskyCanvasContainer.clientHeight;

        // TODO:: Review ---> Canvas dimenstions logic

        this.containerWidth = this.drawableWidth*SCROLLABLE_AREA_FACTOR;
        this.containerHeight = this.drawableHeight*SCROLLABLE_AREA_FACTOR;

        this.minskyCanvasElement.style.width = this.containerWidth + "px";
        this.minskyCanvasElement.style.height = this.containerHeight + "px";

        const clientRect = this.minskyCanvasContainer.getBoundingClientRect();
        this.leftOffset = Math.ceil(clientRect.left);
        this.topOffset = Math.ceil(clientRect.top);
      }
    }
  }


  public static scrollToCenter() {
    this.initializeIfNeeded();
    this.minskyCanvasElement.scrollTop = this.containerHeight/2;
    this.minskyCanvasElement.scrollLeft = this.containerWidth/2;
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


  public static getScrollableArea() {
    this.initializeIfNeeded();
    return {
      width : this.containerWidth,
      height : this.containerHeight
    }
  }



  public static getMinskyCanvasElement(): HTMLElement {
    this.initializeIfNeeded();
    return this.minskyCanvasElement;
  }

  public static getMinskyContainerElement(): HTMLElement {
    this.initializeIfNeeded();
    return this.minskyCanvasContainer;
  }
}

export { WindowUtilitiesGlobal };
