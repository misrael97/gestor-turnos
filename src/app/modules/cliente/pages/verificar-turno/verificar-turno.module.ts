import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VerificarTurnoPageRoutingModule } from './verificar-turno-routing.module';
import { VerificarTurnoPage } from './verificar-turno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificarTurnoPageRoutingModule
  ],
  declarations: [VerificarTurnoPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VerificarTurnoPageModule {}
