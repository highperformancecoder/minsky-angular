interface Offset {
    left : number,
    top : number
}

abstract class WindowUtilitiesGlobal {
    private static minskyCanvasElement: HTMLElement = null;
    private static leftOffset: number = null;
    private static topOffset: number = null;


    private static initializeIfNeeded() {
        if (!this.minskyCanvasElement) {
            this.minskyCanvasElement = document.getElementById('canvas'); // TODO:: Use longer unique id
        }
    }

    public static getMinskyCanvasOffset() : Offset {
        this.initializeIfNeeded();
        if (this.minskyCanvasElement) {
            if (this.leftOffset === null) {
                this.leftOffset = this.minskyCanvasElement.offsetLeft;

                //    (window.pageXOffset || this.minskyCanvasElement.scrollLeft) -
                  //  (this.minskyCanvasElement.clientLeft || 0);
            }

            if (this.topOffset === null) {
                this.topOffset = this.minskyCanvasElement.offsetTop;
                    // (window.pageYOffset || this.minskyCanvasElement.scrollTop) -
                    //(this.minskyCanvasElement.clientTop || 0);
            }
        }

        return {
            left: this.leftOffset,
            top: this.topOffset
        }
    }

    public static getMinskyCanvasElement() : HTMLElement {
        this.initializeIfNeeded();
        return this.minskyCanvasElement;
    }
}


export { WindowUtilitiesGlobal }