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
