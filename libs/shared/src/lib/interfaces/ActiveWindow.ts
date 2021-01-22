import { BrowserWindow } from 'electron';

export interface ActiveWindow {
  id: number;
  size: number[];
  isMainWindow: boolean;
  context: BrowserWindow;
}
