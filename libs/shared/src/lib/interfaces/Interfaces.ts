export interface CairoPayload {
  top?: number;
  left?: number;
  height?: number;
  width?: number;
  filepath?: string;
  command?: string;
  windowId?: number;
}

export interface AppLayoutPayload {
  type: string;
  value: any;
}

export interface HeaderEvent {
  action: string;
  target: string;
}
