import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@minsky/shared';
import { BookmarkPositionComponent } from './bookmark-position/bookmark-position.component';
import { BookmarksRoutingModule } from './bookmarks-routing.module';

@NgModule({
  declarations: [BookmarkPositionComponent],
  imports: [
    CommonModule,
    BookmarksRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class BookmarksModule {}
