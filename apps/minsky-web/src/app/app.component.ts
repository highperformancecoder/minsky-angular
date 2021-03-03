import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService, ElectronService } from '@minsky/core';
import { CairoPayload } from '@minsky/shared';
import { TranslateService } from '@ngx-translate/core';
import { ResizedEvent } from 'angular-resize-event';
import * as debug from 'debug';
import { AppConfig } from '../environments/environment';

const logInfo = debug('minsky:web:info');
const logError = debug('minsky:web:error');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loader = false;
  directory: string[];
  toggleButtonText = 'Start Minsky Service';
  isTerminalDisabled = true;

  constructor(
    private electronService: ElectronService,
    private cmService: CommunicationService,
    private translate: TranslateService,
    public router: Router
  ) {
    this.translate.setDefaultLang('en');
    logInfo('AppConfig', AppConfig);

    if (electronService.isElectron) {
      logInfo('Run in electron');
    } else {
      logInfo('Run in browser');
    }
    this.openFile();
    this.saveFile();
    this.windowSize();
    this.cmService.canvasOffsetValues();
  }

  windowSize() {
    // code for window size
    const windowDetail = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    logInfo(
      'width:' + window.innerWidth + ' ' + 'height:' + window.innerHeight
    );

    this.emitData(windowDetail);
  }

  windowResize(event: ResizedEvent) {
    const windowResizeDetail = {
      resizeWidth: event.newWidth,
      resizeHeight: event.newHeight,
    };

    logInfo(
      'resizeWidth:' + event.newWidth + ' ' + 'resizeHeight:' + event.newWidth
    );

    if (this.electronService.isElectron) {
      const payload = {
        type: 'RESIZE',
        value: { height: event.newHeight, width: event.newWidth },
      };

      this.electronService.ipcRenderer.send('app-layout-changed', payload);
    } else {
      this.emitData(windowResizeDetail);
    }

    this.cmService.canvasOffsetValues();
  }

  saveFile() {
    this.cmService.directory.subscribe((value) => {
      this.directory = value;
      this.emitData(this.directory);
    });
  }

  openFile() {
    this.cmService.openDirectory.subscribe((value) => {
      this.emitData(value);
    });
  }

  emitData(data) {
    this.cmService.emitValues('Values', data);
    this.cmService.dispatchEvents('Values');
  }

  async toggleMinskyService() {
    if (this.electronService.isElectron) {
      try {
        const _dialog = await this.electronService.dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filters: [{ name: 'minsky-RESTService', extensions: ['*'] }],
        });

        const minskyRestservicePath = _dialog.filePaths.find((p) =>
          p.includes('minsky-RESTService')
        );

        const groupIconPath = _dialog.filePaths.find((p) =>
          p.includes('group')
        );

        const godleyIconPath = _dialog.filePaths.find((p) =>
          p.includes('bank')
        );

        if (minskyRestservicePath && groupIconPath && godleyIconPath) {
          const initPayload: CairoPayload = {
            command: 'startMinskyProcess',
            filePath: minskyRestservicePath,
          };

          this.cmService.sendCairoEvent(initPayload);

          this.cmService.initMinskyResources({ godleyIconPath, groupIconPath });

          this.isTerminalDisabled = false;
        } else {
          throw new Error(
            'please select minsky executable with group.svg and bank.svg'
          );
        }
      } catch (error) {
        logError(error);
      }
    }
  }

  async startTerminal() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('create-menu-popup', {
        title: 'x-term',
        url: 'http://localhost:4200/#/experiment/xterm',
        modal: false,
        width: 900,
        height: 768,
      });
    }
  }
}
