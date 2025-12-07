import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [LayoutComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutModule { }
