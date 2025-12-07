import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export const clienteRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'mi-turno',
    loadChildren: () => import('./pages/mi-turno/mi-turno.module').then(m => m.MiTurnoPageModule)
  },
  {
    path: 'alertas',
    loadChildren: () => import('./pages/alertas/alertas.module').then(m => m.AlertasPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./pages/historial/historial.module').then(m => m.HistorialPageModule)
  }
];

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'mi-turno',
    loadChildren: () => import('./pages/mi-turno/mi-turno.module').then(m => m.MiTurnoPageModule)
  },
  {
    path: 'alertas',
    loadChildren: () => import('./pages/alertas/alertas.module').then(m => m.AlertasPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./pages/historial/historial.module').then(m => m.HistorialPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule {}
