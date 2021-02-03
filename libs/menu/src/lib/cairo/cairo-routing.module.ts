import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CairoComponent } from './cairo.component';

const routes: Routes = [
  { path: 'cairo-integration', component: CairoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CairoRoutingModule {}
