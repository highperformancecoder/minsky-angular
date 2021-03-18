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
    path: 'insert',
    loadChildren: () =>
      import('./insert/insert.module').then((m) => m.InsertModule),
  },
  {
    path: 'options',
    loadChildren: () =>
      import('./options/options.module').then((m) => m.OptionsModule),
  },
  {
    path: 'simulation',
    loadChildren: () =>
      import('./simulation/simulation.module').then((m) => m.SimulationModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(menuRoutes)],
  declarations: [],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
