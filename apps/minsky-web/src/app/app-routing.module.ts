import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  CliInputComponent,
  EditDescriptionComponent,
  EditGodleyCurrencyComponent,
  EditGodleyTitleComponent,
  EquationsComponent,
  MultipleKeyOperationComponent,
  PageNotFoundComponent,
  ParametersComponent,
  RenameAllInstancesComponent,
  VariablesComponent,
  WiringComponent,
} from '@minsky/ui-components';

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
    path: 'headless/menu',
    loadChildren: () => import('@minsky/menu').then((m) => m.MenuModule),
  },
  {
    path: 'headless/rename-all-instances',
    component: RenameAllInstancesComponent,
  },
  {
    path: 'headless/multiple-key-operation',
    component: MultipleKeyOperationComponent,
  },
  {
    path: 'headless/edit-godley-title',
    component: EditGodleyTitleComponent,
  },
  {
    path: 'headless/edit-godley-currency',
    component: EditGodleyCurrencyComponent,
  },
  {
    path: 'headless/edit-description',
    component: EditDescriptionComponent,
  },
  {
    path: 'headless/terminal',
    component: CliInputComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
