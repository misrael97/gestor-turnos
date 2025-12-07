import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NegociosPage } from './negocios.page';

const routes: Routes = [
  {
    path: '',
    component: NegociosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NegociosPageRoutingModule {}
