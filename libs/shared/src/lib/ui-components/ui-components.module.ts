import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EquationsComponent } from './equations/equations.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ParametersComponent } from './parameters/parameters.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { VariablesComponent } from './variables/variables.component';
import { WiringComponent } from './wiring/wiring.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    PageNotFoundComponent,
    HeaderComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
  ],
  imports: [CommonModule],
  exports: [
    ToolbarComponent,
    PageNotFoundComponent,
    HeaderComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
  ],
})
export class UiComponentsModule {}
