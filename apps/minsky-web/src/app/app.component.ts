/* eslint-disable no-case-declarations */
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService, ElectronService } from '@minsky/core';
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
  toggleButtonText = 'Start Minsky Service';

  constructor(
    private electronService: ElectronService,
    private cmService: CommunicationService,
    private translate: TranslateService,
    public router: Router
  ) {
    this.translate.setDefaultLang('en');
    logInfo('AppConfig', AppConfig);
  }

  ngAfterViewInit() {
    this.cmService.canvasOffsetValues();

    this.cmService.setBackgroundColor();

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Escape':
          this.handleEscKey();
          break;

        case 'Enter':
          this.handleEnterKey();

          break;

        default:
          break;
      }
    });
  }

  // close modals with ESC
  private handleEscKey() {
    const currentWindow = this.electronService.remote.getCurrentWindow();
    const isModal = currentWindow.isModal();

    if (isModal) {
      currentWindow.close();
    }
  }

  // submits form with class="submit" when pressed Enter key
  private handleEnterKey() {
    const buttons = Array.from(
      document.getElementsByClassName('submit')
    ) as HTMLElement[];

    buttons.forEach((b) => {
      console.log(
        '🚀 ~ file: app.component.ts ~ line 68 ~ AppComponent ~ document.addEventListener ~ b',
        b
      );

      b.click();
    });
  }

  windowResize(event: ResizedEvent) {
    const windowResizeDetail = {
      resizeWidth: event.newWidth,
      resizeHeight: event.newHeight,
    };

    logInfo(JSON.stringify(windowResizeDetail));

    if (this.electronService.isElectron) {
      const payload = {
        type: 'RESIZE',
        value: { height: event.newHeight, width: event.newWidth },
      };

      this.electronService.ipcRenderer.send(
        events.ipc.APP_LAYOUT_CHANGED,
        payload
      );
    }

    this.cmService.canvasOffsetValues();
  }

  async toggleMinskyService() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.ipc.TOGGLE_MINSKY_SERVICE);
    }
  }

  async startTerminal() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.ipc.CREATE_MENU_POPUP, {
        title: 'Terminal',
        url: `${rendererAppURL}/#/headless/terminal`,
        width: 800,
        height: 668,
        modal: false,
      });
    }
  }
}
