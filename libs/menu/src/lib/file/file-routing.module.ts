import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { DimensionalAnalysisComponent } from './dimensional-analysis/dimensional-analysis.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'dimensional-analysis', component: DimensionalAnalysisComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileRoutingModule {}
