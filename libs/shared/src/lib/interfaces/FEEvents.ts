/* We need to support left click, right click, ctrl+click etc */

enum FEEvents {
  CLICK,
  MOUSEMOVE,
  MOUSEDOWN,
  MOUSEUP,
  WINDOWRESIZE,
}

class HeaderEvent {
  action: string;
  target: string;
}

export { FEEvents, HeaderEvent };
