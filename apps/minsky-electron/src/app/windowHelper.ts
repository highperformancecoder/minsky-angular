import { BrowserWindow } from "electron";
import * as os from 'os';

export function getWindowId(menuWindow: BrowserWindow) {
    const offset = 0;
    const windowId =
        os.endianness() == 'LE'
            ? menuWindow.getNativeWindowHandle().readInt32LE(offset)
            : menuWindow.getNativeWindowHandle().readInt32BE(offset);

    return windowId;
}
