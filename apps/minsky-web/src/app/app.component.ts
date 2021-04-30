import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommunicationService,
  ElectronService,
  StateManagementService,
} from '@minsky/core';
import { events, rendererAppURL } from '@minsky/shared';
import { TranslateService } from '@ngx-translate/core';
import { ResizedEvent } from 'angular-resize-event';
import * as debug from 'debug';
import { AppConfig } from '../environments/environment';

const logInfo = debug('minsky:web:info');

@Component({
  selector: 'minsky-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  loader = false;
  directory: string[];
  toggleButtonText = 'Start Minsky Service';

  constructor(
    private electronService: ElectronService,
    private cmService: CommunicationService,
    public stateManagementService: StateManagementService,
    private translate: TranslateService,
    public router: Router
  ) {
    this.translate.setDefaultLang('en');
    logInfo('AppConfig', AppConfig);

    if (electronService.isElectron) {
      logInfo('Run in electron');
      this.stateManagementService.init();
    } else {
      logInfo('Run in browser');
    }
    this.openFile();
    this.saveFile();
    this.windowSize();
  }

  ngAfterViewInit() {
    this.cmService.canvasOffsetValues();

    this.cmService.setBackgroundColor();
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

      this.electronService.ipcRenderer.send(
        events.ipc.APP_LAYOUT_CHANGED,
        payload
      );
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
      const isTerminalDisabled = !this.electronService.ipcRenderer.sendSync(
        events.ipc.TOGGLE_MINSKY_SERVICE
      );

      this.stateManagementService.isTerminalDisabled$.next(isTerminalDisabled);
    }
  }

  async startTerminal() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.ipc.CREATE_MENU_POPUP, {
        title: 'Terminal',
        url: `${rendererAppURL}/#/experiment/terminal`,
        modal: false,
        width: 800,
        height: 668,
      });
    }
  }
}
