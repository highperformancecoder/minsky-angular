import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'minsky-edit-godley-title',
  templateUrl: './edit-godley-title.component.html',
  styleUrls: ['./edit-godley-title.component.scss'],
})
export class EditGodleyTitleComponent implements OnDestroy {
  title: string;
  itemId: number;

  constructor(
    private route: ActivatedRoute,
    private electronService: ElectronService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.title = params.title;
      this.itemId = Number(params.itemId);
    });
  }

  async handleEditTitle(newTitle: string) {
    if (this.electronService.isElectron) {
      if (this.itemId) {
        await this.electronService.sendMinskyCommandAndRender({
          command: `${commandsMapping.GET_NAMED_ITEM}/${this.itemId}/second/table/title "${newTitle}"`,
        });
      } else {
        await this.electronService.sendMinskyCommandAndRender({
          command: `${commandsMapping.CANVAS_ITEM_TABLE_TITLE} "${newTitle}"`,
        });

        await this.electronService.sendMinskyCommandAndRender({
          command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
        });
      }
      this.electronService.closeCurrentWindowIfNotMain();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {}
}
