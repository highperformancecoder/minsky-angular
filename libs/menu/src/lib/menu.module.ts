import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FileModule } from './file/file.module';
import { MenuRoutingModule } from './menu-routing.module';

@NgModule({
  imports: [CommonModule, FileModule, MenuRoutingModule],
  declarations: [],
  exports: [],
})
export class MenuModule {}
