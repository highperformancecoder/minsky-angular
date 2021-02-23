import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material/material.module';
import { UiComponentsModule } from './ui-components/ui-components.module';

export const sharedRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    TranslateModule,
    FormsModule,
    UiComponentsModule,
  ],
  declarations: [],
  exports: [MaterialModule, TranslateModule, FormsModule, UiComponentsModule],
})
export class SharedModule {}
