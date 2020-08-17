import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { HomeRoutingModule } from './home/home-routing.module';
import { WiringComponent } from './components/wiring/wiring.component';
import { EquationsComponent } from './components/equations/equations.component';
import { ParametersComponent } from './components/parameters/parameters.component';
import { VariablesComponent } from './components/variables/variables.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'wiring',
    pathMatch: 'full'
  },
  {
    path: 'wiring',
    component: WiringComponent
  },
  {
    path: 'equations',
    component: EquationsComponent
  },
  {
    path: 'parameters',
    component: ParametersComponent
  },
  {
    path: 'variables',
    component: VariablesComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    HomeRoutingModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
