import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "./layout/layout.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { RoleGuard } from "./core/guards/role.guard";

const routes: Routes = [
  { path: "", redirectTo: "auth/login", pathMatch: "full" },

  // 📺 RUTA PÚBLICA - Display de Turnos (sin autenticación, sin layout)
  {
    path: "display-publico/:id",
    loadComponent: () =>
      import("./components/display-publico/display-publico.component").then(
        (m) => m.DisplayPublicoComponent
      ),
  },

  // RUTA PÚBLICA - Verificación de QR (sin autenticación)
  {
    path: "verificar-turno",
    loadChildren: () =>
      import(
        "./modules/cliente/pages/verificar-turno/verificar-turno.module"
      ).then((m) => m.VerificarTurnoPageModule),
  },

  // AUTENTICACIÓN
  {
    path: "auth",
    loadChildren: () =>
      import("./modules/auth/auth.module").then((m) => m.AuthModule),
  },

  // CLIENTE
  {
    path: "cliente",
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: "Cliente" },
    loadChildren: () =>
      import("./modules/cliente/cliente.module").then((m) => m.ClienteModule),
  },

  // EMPLEADO - Atiende turnos en PWA
  {
    path: "empleado",
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: "Empleado" },
    loadChildren: () =>
      import("./modules/empleado/empleado.module").then((m) => m.EmpleadoModule),
  },

  // SUPER - Administrador de Sucursales (rol ID: 2 - Agente)
  {
    path: "super",
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: "Agente" },
    loadChildren: () =>
      import("./modules/super/super.module").then((m) => m.SuperModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
