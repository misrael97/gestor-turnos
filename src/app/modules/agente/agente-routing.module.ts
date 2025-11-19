import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'turnos', pathMatch: 'full' },
  {
    path: 'turnos',
    loadChildren: () => import('./pages/turnos/turnos.module').then(m => m.TurnosPageModule)
  }
  // Módulo 'agente' deprecated - ahora se usa 'super'
  // {
  //   path: 'historial',
  //   loadChildren: () => import('./pages/historial/historial.module').then(m => m.HistorialPageModule)
  // },
  // {
  //   path: 'reportes',
  //   loadChildren: () => import('./pages/reportes/reportes.module').then(m => m.ReportesPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenteRoutingModule {}
