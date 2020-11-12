import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FileModule } from './file/file.module';
import { MenuRoutingModule } from './menu-routing.module';
import { EditModule } from './edit/edit.module';

@NgModule({
  imports: [CommonModule, FileModule, MenuRoutingModule, EditModule],
  declarations: [],
  exports: [],
})
export class MenuModule {}
