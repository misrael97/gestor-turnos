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
  ) { }

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
    // Rutas de Agente
    if (url.includes("/super/dashboard")) {
      this.pageTitle = "Mi Sucursal";
    } else if (url.includes("/super/escanear-qr")) {
      this.pageTitle = "Escanear QR";
    } else if (url.includes("/super/colas")) {
      this.pageTitle = "Gestión de Colas";
    } else if (url.includes("/super/multi-cola")) {
      this.pageTitle = "Multi-Cola";
    } else if (url.includes("/super/display")) {
      this.pageTitle = "Pantalla de Turnos";
    }
    // Rutas de Cliente
    else if (url.includes("/cliente/home")) {
      this.pageTitle = "Inicio";
    } else if (url.includes("/cliente/mi-turno")) {
      this.pageTitle = "Mi Turno";
    } else if (url.includes("/cliente/alertas")) {
      this.pageTitle = "Alertas";
    } else if (url.includes("/cliente/historial")) {
      this.pageTitle = "Historial";
    }
    // Rutas de Empleado
    else if (url.includes("/empleado/turnos")) {
      this.pageTitle = "Atender Turnos";
    } else if (url.includes("/empleado/colas")) {
      this.pageTitle = "Gestión de Colas";
    } else if (url.includes("/empleado/escanear-qr")) {
      this.pageTitle = "Escanear QR";
    } else if (url.includes("/empleado/display")) {
      this.pageTitle = "Pantalla de Turnos";
    } else {
      this.pageTitle = "PWA Gestor de Turnos";
    }
  }

  configurarMenu() {
    const roleName = this.user?.role?.nombre || this.user?.role?.name;
    const roleId = this.user?.role?.id || this.user?.role_id;

    console.log("📋 Configurando menú para rol:", roleName, "ID:", roleId);

    // Verificar rol por nombre o ID
    // role_id 1 = Administrador (NO usa PWA)
    // role_id 2 = Agente (Admin de Sucursal - Operaciones del día)
    // role_id 3 = Cliente (Usuario final)
    // role_id 4 = Empleado (Atiende turnos)

    if (roleName === "Agente" || roleId === 2) {
      console.log("📋 Menú: Agente (Admin de Sucursal)");
      this.menuItems = [
        { title: "Mi Sucursal", icon: "home", path: "/super/dashboard" },
        { title: "Escanear QR", icon: "qr-code", path: "/super/escanear-qr" },
        { title: "Multi-Cola", icon: "list", path: "/super/multi-cola" },
        { title: "Display", icon: "tv", path: "/super/display" },
      ];
    } else if (roleName === "Cliente" || roleId === 3) {
      console.log("📋 Menú: Cliente");
      this.menuItems = [
        { title: "Inicio", icon: "home", path: "/cliente/home" },
        { title: "Mi Turno", icon: "ticket", path: "/cliente/mi-turno" },
        { title: "Alertas", icon: "notifications", path: "/cliente/alertas" },
        { title: "Historial", icon: "time", path: "/cliente/historial" },
      ];
    } else if (roleName === "Empleado" || roleId === 4) {
      console.log("📋 Menú: Empleado");
      this.menuItems = [
        { title: "Turnos", icon: "list", path: "/empleado/turnos" },
        { title: "Colas", icon: "people", path: "/empleado/colas" },
        { title: "Escanear QR", icon: "qr-code", path: "/empleado/escanear-qr" },
        { title: "Display", icon: "tv", path: "/empleado/display" },
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

  /**
   * Determina si debe mostrar sidebar o navbar
   * Sidebar solo para Agente (role_id 2)
   * Navbar para Cliente (role_id 3) y Empleado (role_id 4)
   */
  mostrarSidebar(): boolean {
    const roleId = this.user?.role?.id || this.user?.role_id;
    const roleName = this.user?.role?.nombre || this.user?.role?.name;

    // Solo el Agente (role_id 2) usa sidebar
    return roleName === "Agente" || roleId === 2;
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

  /**
   * Obtiene las iniciales del usuario autenticado
   */
  getUserInitials(): string {
    if (!this.user || !this.user.name) {
      return 'US'; // Usuario por defecto
    }

    const names = this.user.name.trim().split(' ');
    if (names.length === 1) {
      // Si solo hay un nombre, tomar las dos primeras letras
      return names[0].substring(0, 2).toUpperCase();
    } else {
      // Si hay dos o más nombres, tomar la primera letra de cada uno
      return (names[0][0] + names[1][0]).toUpperCase();
    }
  }
}
