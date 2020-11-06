import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/* import {
    MAT_COLOR_FORMATS,
    NgxMatColorPickerModule,
    NGX_MAT_COLOR_FORMATS
} from '@angular-material-components/color-picker' */
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { BookmarkPositionComponent } from './bookmark-position/bookmark-position.component';
import { CreateVariableComponent } from './create-variable/create-variable.component';
import { DimensionsComponent } from './edit/dimensions/dimensions.component';
import { AboutComponent } from './file/about/about.component';
import { DimensionalAnalysisComponent } from './file/dimensional-analysis/dimensional-analysis.component';
import { LogSimulationComponent } from './file/log-simulation/log-simulation.component';
import { ObjectBrowserComponent } from './file/object-browser/object-browser.component';
import { SelectItemsComponent } from './file/select-items/select-items.component';
import { GodleyTableComponent } from './insert/godley-table/godley-table.component';
import { BackgroundColorComponent } from './options/background-color/background-color.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component';

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
    SharedModule,
    // NgxMatColorPickerModule,
  ],
  /* providers: [
		{ provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS },
	], */
})
export class MenuModule {}
