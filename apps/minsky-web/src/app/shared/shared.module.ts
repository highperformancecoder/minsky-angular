import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { TranslateModule } from '@ngx-translate/core'

import { PageNotFoundComponent } from './components/'
import { ToolbarButtonComponent } from './components'
import { WebviewDirective } from './directives/'
import { FormsModule } from '@angular/forms'

@NgModule({
	declarations: [
		PageNotFoundComponent,
		WebviewDirective,
		ToolbarButtonComponent,
	],
	imports: [CommonModule, TranslateModule, FormsModule],
	exports: [
		TranslateModule,
		WebviewDirective,
		FormsModule,
		ToolbarButtonComponent,
	],
})
export class SharedModule {}
