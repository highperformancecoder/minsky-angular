import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  EquationsComponent,
  PageNotFoundComponent,
  ParametersComponent,
  VariablesComponent,
  WiringComponent,
} from '@minsky/shared';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'wiring',
    pathMatch: 'full',
  },
  {
    path: 'wiring',
    component: WiringComponent,
  },
  {
    path: 'equations',
    component: EquationsComponent,
  },
  {
    path: 'parameters',
    component: ParametersComponent,
  },
  {
    path: 'variables',
    component: VariablesComponent,
  },
  {
    path: 'menu',
    loadChildren: () => import('@minsky/menu').then((m) => m.MenuModule),
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
