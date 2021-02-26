import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material/material.module';

export const sharedRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    TranslateModule,
    FormsModule,
  ],
  declarations: [],
  exports: [MaterialModule, TranslateModule, FormsModule],
})
export class SharedModule {}
