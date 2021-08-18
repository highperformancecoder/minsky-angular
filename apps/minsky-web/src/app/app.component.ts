import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService, ElectronService } from '@minsky/core';
import { events, MainRenderingTabs } from '@minsky/shared';
import { TranslateService } from '@ngx-translate/core';
import * as debug from 'debug';
import { AppConfig } from '../environments/environment';
import { ResizedEvent } from 'angular-resize-event';

const logInfo = debug('minsky:web:info');

@Component({
  selector: 'minsky-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  loader = false;
  MainRenderingTabs = MainRenderingTabs;
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
    // When the event DOMContentLoaded occurs, it is safe to access the DOM
    document.addEventListener('DOMContentLoaded', () => {
      this.cmService.setWindowSizeAndCanvasOffsets(false);
    });

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
      b.click();
    });
  }

  windowResize(event: ResizedEvent) {
    logInfo("Got a resize event ", event);
    this.cmService.setWindowSizeAndCanvasOffsets(true);
  }

  toggleMinskyService() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.TOGGLE_MINSKY_SERVICE);
    }
  }

  changeTab(tab: MainRenderingTabs) {
    if (this.electronService.isElectron) {
      const payload = { newTab: tab };
      this.electronService.ipcRenderer.send(events.CHANGE_MAIN_TAB, payload);
    }
  }

  startTerminal() {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(events.CREATE_MENU_POPUP, {
        title: 'Terminal',
        url: `#/headless/terminal`,
        width: 800,
        height: 668,
        modal: false,
      });
    }
  }
}
