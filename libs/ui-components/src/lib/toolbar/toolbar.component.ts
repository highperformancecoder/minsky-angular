import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { TextInputUtilities, CommunicationService, ElectronService } from '@minsky/core';
import { commandsMapping, events, HeaderEvent, TypeValueName } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private static availableOperationsMap = null;

  @Output() toolbarEvent = new EventEmitter<HeaderEvent>();

  headerEvent = 'HEADER_EVENT';

  constructor(
    private electronService: ElectronService,
    public communicationService: CommunicationService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  showPlayButton = false;

  ngOnInit(): void {
    this.communicationService.showPlayButton$.subscribe((showPlayButton) => {
      this.showPlayButton = showPlayButton;
      this.changeDetectorRef.detectChanges();
    });
  }


  private async getAvailableOperations(): Promise<Object> {
    if (!ToolbarComponent.availableOperationsMap) {
      ToolbarComponent.availableOperationsMap = {};
      const list = await this.electronService.sendMinskyCommandAndRender(
        {
          command: commandsMapping.AVAILABLE_OPERATIONS,
          render: false,
        }) as string[];

      list.forEach((value) => {
        ToolbarComponent.availableOperationsMap[value.toLowerCase()] = value;
      });
    }
    return ToolbarComponent.availableOperationsMap;
  }

  playButton() {
    if (this.showPlayButton) {
      this.toolbarEvent.emit({
        action: 'CLICKED',
        target: 'PLAY',
      });
    } else {
      this.toolbarEvent.emit({
        action: 'CLICKED',
        target: 'PAUSE',
      });
    }

    this.communicationService.showPlayButton$.next(
      !this.communicationService.showPlayButton$.value
    );
  }

  resetButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'RESET',
    });
  }

  stepButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'STEP',
    });
  }

  simulationSpeed(value) {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'SIMULATION_SPEED',
      value: value,
    });
  }

  zoomOutButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOM_OUT',
    });
  }

  zoomInButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOM_IN',
    });
  }

  resetZoomButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'RESET_ZOOM',
    });
  }

  zoomToFitButton() {
    this.toolbarEvent.emit({
      action: 'CLICKED',
      target: 'ZOOM_TO_FIT',
    });
  }



  private showCreateVariablePopup(title: string, params: TypeValueName) {
    const urlParts = Object.keys(params).map((pKey) => { return `${pKey}=${params[pKey]}`; }).join("&");

    this.electronService.ipcRenderer.send(events.CREATE_MENU_POPUP, {
      width: 500,
      height: 650,
      title: title,
      url: `#/headless/menu/insert/create-variable?${urlParts}`,
    });
  }

  async handleTextInputSubmit() {
    const inputString = TextInputUtilities.getValue();
    TextInputUtilities.hide();

    if (this.electronService.isElectron) {
      if (inputString.charAt(0) === '#') {
        const note = inputString.slice(1);
        this.communicationService.insertElement('ADD_NOTE', note, 'string');
        return;
      }

      if (inputString.charAt(0) === '-') {
        this.showCreateVariablePopup('Create Constant', { type: 'constant', value: inputString });
        return;
      }

      const availableOperations = await this.getAvailableOperations();
      const operation = availableOperations[inputString.toLowerCase()];

      if (operation) {
        this.communicationService.addOperation(operation);
        return;
      }

      const value = parseFloat(inputString);
      const isConstant = !isNaN(value);
      const popupTitle = isConstant ? 'Create Constant' : 'Specify Variable Name';
      const params: TypeValueName = { type: (isConstant ? 'constant' : 'flow'), name: inputString };
      if (isConstant) {
        params.value = value;
      }

      this.showCreateVariablePopup(popupTitle, params);
      return;
    }
  }

  closeTextInput() {
    TextInputUtilities.hide();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() { }
}
