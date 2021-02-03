// export const serverPortRangeStart = 3000;

import { ActiveWindow } from '@minsky/shared';

// export const serverPortRangeEnd = 3005;
export const rendererAppPort = 4200;
export const rendererAppURL = `http://localhost:${rendererAppPort}`;
export const rendererAppName = 'minsky-web';
export const electronAppName = 'minsky-electron';
export const backgroundColor = '#c1c1c1';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here

export const activeWindows = new Map<number, ActiveWindow>();
