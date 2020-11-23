import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FileModule } from './file/file.module';
import { MenuRoutingModule } from './menu-routing.module';
import { EditModule } from './edit/edit.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { InsertModule } from './insert/insert.module';
import { OptionsModule } from './options/options.module';
import { RungeKuttaModule } from './runge-kutta/runge-kutta.module';

@NgModule({
  imports: [CommonModule, FileModule, MenuRoutingModule, EditModule, BookmarksModule, InsertModule, OptionsModule, RungeKuttaModule],
  declarations: [],
  exports: [],
})
export class MenuModule {}
