import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquationsComponent } from './components/equations/equations.component';
import { ParametersComponent } from './components/parameters/parameters.component';
import { VariablesComponent } from './components/variables/variables.component';
import { WiringComponent } from './components/wiring/wiring.component';
import { HomeRoutingModule } from './home/home-routing.module';
import { PageNotFoundComponent } from './shared/components';

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
  imports: [RouterModule.forRoot(routes, { useHash: true }), HomeRoutingModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
