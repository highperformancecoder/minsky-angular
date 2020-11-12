import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

const menuRoutes: Route[] = [
  {
    path: 'file',
    loadChildren: () => import('./file/file.module').then((m) => m.FileModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(menuRoutes)],
  declarations: [],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
