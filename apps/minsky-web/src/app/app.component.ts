import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommunicationService,
  ElectronService,
  TopMenuService,
} from '@minsky/core';
import { TranslateService } from '@ngx-translate/core';
// Import the resized event model
import { ResizedEvent } from 'angular-resize-event';
import * as debug from 'debug';
import { AppConfig } from '../environments/environment';

const logInfo = debug('minsky:web:info');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loader = false;
  directory: string[];

  constructor(
    private electronService: ElectronService,
    private cmService: CommunicationService,
    private topMenuService: TopMenuService,
    private translate: TranslateService,
    public router: Router
  ) {
    this.translate.setDefaultLang('en');
    logInfo('AppConfig', AppConfig);

    if (electronService.isElectron) {
      logInfo(process.env);
      logInfo('Run in electron');
      logInfo('Electron ipcRenderer', this.electronService.ipcRenderer);
      logInfo('NodeJS childProcess', this.electronService.childProcess);
      // code for top menu
      this.topMenuService.topMenu();
      this.windowDetails();
    } else {
      logInfo('Run in browser');
    }
    this.openFile();
    this.saveFile();
    this.windowSize();
    this.cmService.canvasOffsetValues();
  }

  windowDetails() {
    // code for X11 window
    const winHandle = this.electronService.remote
      .getCurrentWindow()
      .getNativeWindowHandle();
    logInfo(winHandle);
    this.emitData(winHandle);
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
    this.cmService.canvasOffsetValues();
    this.emitData(windowResizeDetail);
  }

  saveFile() {
    this.cmService.directory.subscribe((value) => {
      this.directory = value;
      // logInfo(this.directory)
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
}
