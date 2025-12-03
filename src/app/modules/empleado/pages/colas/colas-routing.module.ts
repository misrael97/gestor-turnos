import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColasPage } from './colas.page';

const routes: Routes = [
  {
    path: '',
    component: ColasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColasPageRoutingModule {}
