import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { TempComponent } from './temp/temp.component';

export const menuRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [TempComponent],
  exports: [TempComponent],
})
export class MenuModule {}
