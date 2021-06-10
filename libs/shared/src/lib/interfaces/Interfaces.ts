export interface MinskyProcessPayload {
  mouseX?: number;
  mouseY?: number;
  filePath?: string;
  command?: string;
  windowId?: number;
  showServiceStartedDialog?: boolean;
  key?: string;
  shift?: boolean;
  capsLock?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  args?: Record<string, unknown>;
}

export interface AppLayoutPayload {
  type: string;
  value: any;
}

export interface HeaderEvent {
  action: string;
  target: string;
  value?: unknown;
}

export enum ClassType {
  Variable = 'Variable',
  VarConstant = 'VarConstant',
  Operation = 'Operation',
  IntOp = 'IntOp',
  DataOp = 'DataOp',
  PlotWidget = 'PlotWidget',
  GodleyIcon = 'GodleyIcon',
  Group = 'Group',
  Item = 'Item',
  SwitchIcon = 'SwitchIcon',
  Ravel = 'Ravel',
  Lock = 'Lock',
}

export interface CanvasItem {
  classType: ClassType;
  value: number;
}
