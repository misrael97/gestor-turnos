import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MiTurnoPage } from './mi-turno.page';

const routes: Routes = [
  {
    path: '',
    component: MiTurnoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiTurnoPageRoutingModule {}
