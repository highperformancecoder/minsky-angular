import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunicationService, ElectronService } from '@minsky/core';
import { commandsMapping, events } from '@minsky/shared';

@Component({
  selector: 'minsky-multiple-key-operation',
  templateUrl: './multiple-key-operation.component.html',
  styleUrls: ['./multiple-key-operation.component.scss'],
})
export class MultipleKeyOperationComponent implements OnInit {
  multipleKeyString = '';

  constructor(
    private electronService: ElectronService,
    private route: ActivatedRoute,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.multipleKeyString = localStorage.getItem('multipleKeyString');
  }

  async handleSave(inputString: string) {
    if (this.electronService.isElectron) {
      if (!inputString) {
        this.electronService.closeCurrentWindow();
        return;
      }

      if (inputString.charAt(0) === '#') {
        const note = inputString.slice(1);

        this.communicationService.insertElement('ADD_NOTE', note, 'string');
        this.electronService.closeCurrentWindow();
        return;
      }

      if (inputString.charAt(0) === '-') {
        this.electronService.ipcRenderer.send(events.CREATE_MENU_POPUP, {
          width: 500,
          height: 650,
          title: 'Create Constant',
          url: `#/headless/menu/insert/create-variable?type=constant&value=${inputString}`,
        });
        this.electronService.closeCurrentWindow();
        return;
      }

      const availableOperations = (await this.electronService.sendMinskyCommandAndRender(
        {
          command: commandsMapping.AVAILABLE_OPERATIONS,
          render: false,
        }
      )) as string[];

      const operation = availableOperations.find(
        (o) => o.toLowerCase() === inputString.toLowerCase()
      );

      if (operation) {
        this.communicationService.addOperation(operation);
        this.electronService.closeCurrentWindow();
        return;
      }

      this.electronService.ipcRenderer.send(events.CREATE_MENU_POPUP, {
        width: 500,
        height: 650,
        title: 'Specify variable name',
        url: `#/headless/menu/insert/create-variable?type=flow&name=${inputString}`,
      });
      this.electronService.closeCurrentWindow();
      return;
    }
  }
}
