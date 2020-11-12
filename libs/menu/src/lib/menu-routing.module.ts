import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

const menuRoutes: Route[] = [
  {
    path: 'file',
    loadChildren: () => import('./file/file.module').then((m) => m.FileModule),
  },
  {
    path: 'edit',
    loadChildren: () => import('./edit/edit.module').then((m) => m.EditModule),
  },
  {
    path: 'bookmarks',
    loadChildren: () =>
      import('./bookmarks/bookmarks.module').then((m) => m.BookmarksModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(menuRoutes)],
  declarations: [],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
