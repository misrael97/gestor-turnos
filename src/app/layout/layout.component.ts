import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";
import { Router, NavigationEnd } from "@angular/router";
import { MenuController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

interface MenuItem {
  title: string;
  icon: string;
  path: string;
}

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"],
})
export class LayoutComponent implements OnInit, OnDestroy {
  user: any;
  menuItems: MenuItem[] = [];
  pageTitle = "PWA Gestor de Turnos";
  private userSubscription: Subscription;
  private routerSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios del usuario
    this.userSubscription = this.auth.userChanges.subscribe((user) => {
      this.user = user;
      console.log("📋 Layout - Usuario actualizado:", this.user);
      console.log("📋 Layout - Rol completo:", this.user?.role);
      this.configurarMenu();
    });

    // Actualizar título según la ruta
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.actualizarTitulo(event.url);
      });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  actualizarTitulo(url: string) {
    if (url.includes("/admin/negocios")) {
      this.pageTitle = "Gestión de Sucursales";
    } else if (url.includes("/admin/usuarios")) {
      this.pageTitle = "Gestión de Usuarios";
    } else if (url.includes("/admin/reportes")) {
      this.pageTitle = "Reportes Globales";
    } else if (url.includes("/super/dashboard")) {
      this.pageTitle = "Mi Sucursal";
    } else if (url.includes("/super/escanear-qr")) {
      this.pageTitle = "Escanear QR";
    } else if (url.includes("/super/colas")) {
      this.pageTitle = "Gestión de Colas";
    } else if (url.includes("/super/multi-cola")) {
      this.pageTitle = "Multi-Cola";
    } else if (url.includes("/agente/display")) {
      this.pageTitle = "Pantalla de Turnos";
    } else if (url.includes("/cliente/home")) {
      this.pageTitle = "Inicio";
    } else if (url.includes("/cliente/mi-turno")) {
      this.pageTitle = "Mi Turno";
    } else if (url.includes("/cliente/alertas")) {
      this.pageTitle = "Alertas";
    } else if (url.includes("/cliente/historial")) {
      this.pageTitle = "Historial";
    } else {
      this.pageTitle = "PWA Gestor de Turnos";
    }
  }

  configurarMenu() {
    const roleName = this.user?.role?.nombre || this.user?.role?.name;
    const roleId = this.user?.role?.id || this.user?.role_id;

    console.log("📋 Configurando menú para rol:", roleName, "ID:", roleId);

    // Verificar rol por nombre o ID
    // role_id 1 = Administrador (JEFE MÁXIMO - Gestión del sistema)
    // role_id 2 = Agente (Admin de Sucursal - Operaciones del día)
    // role_id 3 = Cliente (Usuario final)

    if (roleName === "Administrador" || roleId === 1) {
      console.log("📋 Menú: Administrador (Control total sistema)");
      this.menuItems = [
        { title: "Sucursales", icon: "business", path: "/admin/negocios" },
        { title: "Usuarios", icon: "people", path: "/admin/usuarios" },
        { title: "Reportes", icon: "bar-chart", path: "/admin/reportes" },
      ];
    } else if (roleName === "Agente" || roleId === 2) {
      console.log("📋 Menú: Agente (Admin de Sucursal)");
      this.menuItems = [
        { title: "Mi Sucursal", icon: "home", path: "/super/dashboard" },
        { title: "Escanear QR", icon: "qr-code", path: "/super/escanear-qr" },
        { title: "Multi-Cola", icon: "list", path: "/super/multi-cola" },
        { title: "Display", icon: "tv", path: "/agente/display" },
      ];
    } else if (roleName === "Cliente" || roleId === 3) {
      console.log("📋 Menú: Cliente");
      this.menuItems = [
        { title: "Inicio", icon: "home", path: "/cliente/home" },
        { title: "Mi Turno", icon: "ticket", path: "/cliente/mi-turno" },
        { title: "Alertas", icon: "notifications", path: "/cliente/alertas" },
        { title: "Historial", icon: "time", path: "/cliente/historial" },
      ];
    } else {
      console.log("📋 Menú: Rol desconocido, usando menú de cliente");
      this.menuItems = [
        { title: "Inicio", icon: "home", path: "/cliente/home" },
        { title: "Mi Turno", icon: "ticket", path: "/cliente/mi-turno" },
      ];
    }

    console.log("📋 Items del menú configurados:", this.menuItems);
  }

  cerrarSesion() {
    this.menuCtrl.close();
    this.auth.logout();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  navegar(path: string) {
    this.menuCtrl.close();
    this.router.navigate([path]);
  }
}
