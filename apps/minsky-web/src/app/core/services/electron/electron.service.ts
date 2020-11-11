import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as childProcess from 'child_process';
import { dialog, ipcMain, ipcRenderer, remote, webFrame } from 'electron';
import * as fs from 'fs';
import isElectron from 'is-electron';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  ipcMain: typeof ipcMain;
  dialog: typeof dialog;
  isElectron = isElectron();

  constructor() {
    // Conditional imports

    if (this.isElectron) {
      this.ipcRenderer = (<any>window).require('electron').ipcRenderer;
      this.webFrame = (<any>window).require('electron').webFrame;
      this.remote = (<any>window).require('electron').remote;
      this.ipcMain = (<any>window).require('electron').ipcMain;
      this.dialog = (<any>window).require('electron').dialog;
      this.childProcess = (<any>window).require('child_process');
      this.fs = (<any>window).require('fs');
    }
  }
}
