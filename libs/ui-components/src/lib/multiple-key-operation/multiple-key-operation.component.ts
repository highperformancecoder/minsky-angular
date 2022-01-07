import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CommunicationService,
  ElectronService,
  WindowUtilityService,
} from '@minsky/core';
import { commandsMapping, events, TypeValueName } from '@minsky/shared';

@Component({
  selector: 'minsky-multiple-key-operation',
  templateUrl: './multiple-key-operation.component.html',
  styleUrls: ['./multiple-key-operation.component.scss'],
})


export class MultipleKeyOperationComponent implements OnInit {
  multipleKeyString = '';
  private static availableOperationsMap = null;

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
    private communicationService: CommunicationService,
    private windowUtilityService: WindowUtilityService
  ) {
  }

  private async getAvailableOperations(): Promise<Object> {
    if (!MultipleKeyOperationComponent.availableOperationsMap) {
      MultipleKeyOperationComponent.availableOperationsMap = {};
      const list = await this.electronService.sendMinskyCommandAndRender(
        {
          command: commandsMapping.AVAILABLE_OPERATIONS,
          render: false,
        }) as string[];

      list.forEach((value) => {
        MultipleKeyOperationComponent.availableOperationsMap[value.toLowerCase()] = value;
      });
    }
    return MultipleKeyOperationComponent.availableOperationsMap;
  }

  ngOnInit() {
    this.multipleKeyString = localStorage.getItem('multipleKeyString');
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

  async handleSave(inputString: string) {
    if (this.electronService.isElectron) {
      this.windowUtilityService.closeCurrentWindowIfNotMain();
      if (!inputString) {
        return;
      }

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
}