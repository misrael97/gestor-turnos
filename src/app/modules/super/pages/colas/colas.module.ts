import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColasPageRoutingModule } from './colas-routing.module';

import { ColasPage } from './colas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColasPageRoutingModule
  ],
  declarations: [ColasPage]
})
export class ColasPageModule {}
