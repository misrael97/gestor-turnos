import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VerificarTurnoPage } from './verificar-turno.page';

const routes: Routes = [
  {
    path: '',
    component: VerificarTurnoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificarTurnoPageRoutingModule {}
