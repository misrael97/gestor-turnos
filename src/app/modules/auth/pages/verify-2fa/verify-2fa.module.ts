import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Verify2faPageRoutingModule } from './verify-2fa-routing.module';
import { Verify2faPage } from './verify-2fa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    Verify2faPageRoutingModule
  ],
  declarations: [Verify2faPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Verify2faPageModule {}
