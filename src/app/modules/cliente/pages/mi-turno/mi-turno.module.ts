import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { QRCodeModule } from 'angularx-qrcode';

import { MiTurnoPageRoutingModule } from './mi-turno-routing.module';

import { MiTurnoPage } from './mi-turno.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MiTurnoPageRoutingModule,
    QRCodeModule,
    SharedModule
  ],
  declarations: [MiTurnoPage]
})
export class MiTurnoPageModule {}
