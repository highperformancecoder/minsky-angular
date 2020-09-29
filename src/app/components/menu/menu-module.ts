import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutComponent } from './file/about/about.component'
import { DimensionalAnalysisComponent } from './file/dimensional-analysis/dimensional-analysis.component'
import { LogSimulationComponent } from './file/log-simulation/log-simulation.component'
import { ObjectBrowserComponent } from './file/object-browser/object-browser.component'
import { SelectItemsComponent } from './file/select-items/select-items.component'
import { BookmarkPositionComponent } from './bookmark-position/bookmark-position.component'
import { CreateVariableComponent } from './create-variable/create-variable.component'
import { DimensionsComponent } from './edit/dimensions/dimensions.component'
import { PreferencesComponent } from './preferences/preferences.component'
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component'
import { BackgroundColorComponent } from './options/background-color/background-color.component'
import { MatLabel, MatFormField } from '@angular/material/form-field'
import { MaterialModule } from '../../material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { GodleyTableComponent } from './insert/godley-table/godley-table.component'

@NgModule({
	declarations: [
		AboutComponent,
		DimensionalAnalysisComponent,
		LogSimulationComponent,
		ObjectBrowserComponent,
		SelectItemsComponent,
		BookmarkPositionComponent,
		CreateVariableComponent,
		DimensionsComponent,
		PreferencesComponent,
		RungeKuttaParametersComponent,
		BackgroundColorComponent,
		GodleyTableComponent,
	],
	imports: [
		CommonModule,
		MaterialModule,
		ReactiveFormsModule,
		FormsModule,
		MatFormField,
		MatLabel,
	],
})
export class MenuModule {}
