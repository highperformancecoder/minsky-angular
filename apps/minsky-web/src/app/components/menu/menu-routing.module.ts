import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  // 	path: 'bookmark',
  // 	component: BookmarkPositionComponent,
  // },
  // {
  //   path: 'create-variable',
  //   component: CreateVariableComponent,
  // },
  // {
  // 	path: 'dimensions',
  // 	component: BackgroundColorComponent,
  // },
  // {
  //   path: 'preferences',
  //   component: PreferencesComponent,
  // },
  // {
  //   path: 'rk-parameters',
  //   component: RungeKuttaParametersComponent,
  // },
  // {
  //   path: '**',
  //   component: PageNotFoundComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
