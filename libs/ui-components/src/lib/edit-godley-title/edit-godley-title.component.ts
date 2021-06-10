import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';

@Component({
  selector: 'minsky-edit-godley-title',
  templateUrl: './edit-godley-title.component.html',
  styleUrls: ['./edit-godley-title.component.scss'],
})
export class EditGodleyTitleComponent implements OnInit {
  title: string;
  constructor(
    private route: ActivatedRoute,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.title = params['title'];
    });
  }

  async handleEditTitle(newTitle: string) {
    if (this.electronService.isElectron) {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.CANVAS_ITEM_TABLE_TITLE} "${newTitle}"`,
      });

      await this.electronService.sendMinskyCommandAndRender({
        command: `${commandsMapping.CANVAS_REQUEST_REDRAW}"`,
      });

      this.electronService.remote.getCurrentWindow().close();
    }
  }
}
