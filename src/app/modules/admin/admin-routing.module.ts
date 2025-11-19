import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'negocios', pathMatch: 'full' },
  {
    path: 'negocios',
    loadChildren: () => import('./pages/negocios/negocios.module').then(m => m.NegociosPageModule)
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./pages/usuarios/usuarios.module').then(m => m.UsuariosPageModule)
  },
  {
    path: 'reportes',
    loadChildren: () => import('./pages/reportes/reportes.module').then(m => m.ReportesPageModule)
  },
  {
    path: 'display-tv',
    loadChildren: () => import('./pages/display-tv/display-tv.module').then(m => m.DisplayTvPageModule)
  },
  // Rutas antiguas (por compatibilidad temporal)
  {
    path: 'dashboard',
    redirectTo: 'negocios',
    pathMatch: 'full'
  },
  {
    path: 'colas',
    redirectTo: 'negocios',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
