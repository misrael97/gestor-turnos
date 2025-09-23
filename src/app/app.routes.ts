import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { NegociosComponent } from './components/negocios/negocios';
import { SucursalesComponent } from './components/sucursales/sucursales';
import { GestoresComponent } from './components/gestores/gestores';
import { LayoutComponent } from './components/layout/layout';
import { UsuariosComponent } from './components/usuarios/usuarios';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'negocios', component: NegociosComponent },
      { path: 'sucursales', component: SucursalesComponent },
      { path: 'gestores', component: GestoresComponent },
      { path: 'usuarios', component: UsuariosComponent },
      {
        path: 'turnos',
        loadComponent: () => import('./components/turnos/turnos').then(m => m.TurnosComponent)
      },
      {
        path: 'colas',
        loadComponent: () => import('./components/colas/colas').then(m => m.ColasComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./components/citas/citas').then(m => m.CitasComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./components/reportes/reportes').then(m => m.ReportesComponent)
      },
      {
        path: 'alertas',
        loadComponent: () => import('./components/alertas/alertas').then(m => m.AlertasComponent)
      },
    ]
  }
];
