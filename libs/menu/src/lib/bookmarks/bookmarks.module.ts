import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookmarksRoutingModule } from './bookmarks-routing.module';
import { BookmarkPositionComponent } from './bookmark-position/bookmark-position.component';


@NgModule({
  declarations: [BookmarkPositionComponent],
  imports: [
    CommonModule,
    BookmarksRoutingModule
  ]
})
export class BookmarksModule { }
