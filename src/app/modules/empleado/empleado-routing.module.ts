import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  { path: "", redirectTo: "turnos", pathMatch: "full" },
  {
    path: "turnos",
    loadChildren: () =>
      import("./pages/turnos/turnos.module").then((m) => m.TurnosPageModule),
  },
  {
    path: "display",
    loadChildren: () =>
      import("./pages/display/display.module").then((m) => m.DisplayPageModule),
  },
  {
    path: "colas",
    loadChildren: () =>
      import("./pages/colas/colas.module").then((m) => m.ColasPageModule),
  },
  {
    path: "escanear-qr",
    loadChildren: () =>
      import("./pages/escanear-qr/escanear-qr.module").then((m) => m.EscanearQrPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpleadoRoutingModule {}
