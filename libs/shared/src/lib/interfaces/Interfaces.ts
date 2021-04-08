export interface MinskyProcessPayload {
  mouseX?: number;
  mouseY?: number;
  filePath?: string;
  command?: string;
  windowId?: number;
  showServiceStartedDialog?: boolean;
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
