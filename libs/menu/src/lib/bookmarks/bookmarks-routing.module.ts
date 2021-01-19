import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookmarkPositionComponent } from './bookmark-position/bookmark-position.component';

const routes: Routes = [
  { path: 'bookmark-position', component: BookmarkPositionComponent },
  // { path: 'delete-bookmark', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookmarksRoutingModule {}
