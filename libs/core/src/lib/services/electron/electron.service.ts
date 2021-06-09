import { Injectable } from '@angular/core';
import { events, MinskyProcessPayload } from '@minsky/shared';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, remote } from 'electron';
import isElectron from 'is-electron';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  remote: typeof remote;
  isElectron = isElectron();

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = (<any>window).require('electron').ipcRenderer;
      this.remote = (<any>window).require('electron').remote;
    }
  }

  async sendMinskyCommandAndRender(
    payload: MinskyProcessPayload,
    customEvent: string = null
  ): Promise<unknown> {
    if (this.isElectron) {
      if (customEvent) {
        return await this.ipcRenderer.invoke(customEvent, {
          ...payload,
          command: payload.command.trim(),
        });
      }

      return await this.ipcRenderer.invoke(events.ipc.MINSKY_PROCESS, {
        ...payload,
        command: payload.command.trim(),
      });
    }
  }
}
