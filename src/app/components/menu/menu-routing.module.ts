import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AboutComponent } from './file/about/about.component'
import { PageNotFoundComponent } from '../../shared/components/page-not-found/page-not-found.component'

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
	{
		path: '**',
		component: PageNotFoundComponent,
	},
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MenuRoutingModule {}
