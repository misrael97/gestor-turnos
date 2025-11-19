import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'colas',
    loadChildren: () => import('./pages/colas/colas.module').then(m => m.ColasPageModule)
  },
  {
    path: 'multi-cola',
    loadChildren: () => import('./pages/colas/colas.module').then(m => m.ColasPageModule)
  },
  {
    path: 'escanear-qr',
    loadChildren: () => import('./pages/escanear-qr/escanear-qr.module').then(m => m.EscanearQrPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuperRoutingModule {}
