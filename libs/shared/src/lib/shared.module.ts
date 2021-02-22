import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material/material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';

export const sharedRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    TranslateModule,
    FormsModule,
  ],
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent, MaterialModule, TranslateModule, FormsModule],
})
export class SharedModule {}
