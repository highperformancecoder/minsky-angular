import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
    private changeDetectorRef: ChangeDetectorRef,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.multipleKeyString = params['input'];
      this.changeDetectorRef.detectChanges();
    });
  }

  async handleSave(string) {
    if (this.electronService.isElectron) {
      if (!string) {
        return;
      }

      if (string.charAt(0) === '#') {
        const note = string.slice(1);

        this.communicationService.insertElement('ADD_NOTE', note, 'string');
        return;
      }

      const availableOperations = (await this.electronService.sendMinskyCommandAndRender(
        {
          command: commandsMapping.AVAILABLE_OPERATIONS,
          render: false,
        }
      )) as string[];

      const operation = availableOperations.find(
        (o) => o.toLowerCase() === string.toLowerCase()
      );

      if (operation) {
        this.communicationService.addOperation(operation);
        return;
      }

      this.electronService.ipcRenderer.send(events.CREATE_MENU_POPUP, {
        width: 500,
        height: 550,
        title: 'Specify variable name',
        url: `#/headless/menu/insert/create-variable/flow/${string}`,
      });

      return;
    }
  }
}
