export interface CairoPayload {
    top?: number;
    left?: number;
    height?: number;
    width?: number;
    filepath?: string;
    command?: string;
    windowId?: number;
}