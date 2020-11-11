import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../../shared/components/page-not-found/page-not-found.component';
// import { BookmarkPositionComponent } from './bookmark-position/bookmark-position.component'
import { CreateVariableComponent } from './create-variable/create-variable.component';
import { AboutComponent } from './file/about/about.component';
// import { BackgroundColorComponent } from './options/background-color/background-color.component'
import { PreferencesComponent } from './preferences/preferences.component';
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'about',
    pathMatch: 'full',
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  // {
  // 	path: 'bookmark',
  // 	component: BookmarkPositionComponent,
  // },
  {
    path: 'create-variable',
    component: CreateVariableComponent,
  },
  // {
  // 	path: 'dimensions',
  // 	component: BackgroundColorComponent,
  // },
  {
    path: 'preferences',
    component: PreferencesComponent,
  },
  {
    path: 'rk-parameters',
    component: RungeKuttaParametersComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
