import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CairoModule } from './cairo/cairo.module';
import { EditModule } from './edit/edit.module';
import { FileModule } from './file/file.module';
import { InsertModule } from './insert/insert.module';
import { MenuRoutingModule } from './menu-routing.module';
import { OptionsModule } from './options/options.module';
import { RungeKuttaModule } from './runge-kutta/runge-kutta.module';

@NgModule({
  imports: [
    CommonModule,
    FileModule,
    MenuRoutingModule,
    EditModule,
    BookmarksModule,
    InsertModule,
    OptionsModule,
    RungeKuttaModule,
    CairoModule,
  ],
  declarations: [],
  exports: [],
})
export class MenuModule {}
