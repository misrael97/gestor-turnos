import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SplashScreen } from "@capacitor/splash-screen";
import { SwUpdate } from "@angular/service-worker";
import { AuthService } from "./core/services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private swUpdate: SwUpdate
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.checkForUpdates();
  }

  initializeApp() {
    /* To make sure we provide the fastest app loading experience
       for our users, hide the splash screen automatically
       when the app is ready to be used:

        https://capacitor.ionicframework.com/docs/apis/splash-screen#hiding-the-splash-screen
    */
    SplashScreen.hide();

    // Redirigir según el rol del usuario si ya está autenticado
    this.redirectIfAuthenticated();
  }

  private redirectIfAuthenticated() {
    if (this.auth.isAuthenticated && this.auth.user) {
      const user = this.auth.user;
      const roleName = user.role?.nombre || user.role?.name;
      const roleId = user.role?.id || user.role_id;

      console.log("👤 Usuario autenticado detectado:", { roleName, roleId });

      // No redirigir si ya está en una ruta válida de su módulo
      const currentUrl = this.router.url;

      if (roleId === 1 && !currentUrl.startsWith("/admin")) {
        // Administrador
        console.log("🔄 Redirigiendo a módulo Admin");
        this.router.navigate(["/admin/dashboard"]);
      } else if (roleId === 2 && !currentUrl.startsWith("/super")) {
        // Agente
        console.log("🔄 Redirigiendo a módulo Agente");
        this.router.navigate(["/super/display"]);
      } else if (roleId === 3 && !currentUrl.startsWith("/cliente")) {
        // Cliente
        console.log("🔄 Redirigiendo a módulo Cliente");
        this.router.navigate(["/cliente/home"]);
      }
    }
  }

  private checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      console.log(
        "🔄 PWA - Service Worker activo, verificando actualizaciones..."
      );

      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === "VERSION_READY") {
          console.log("✅ PWA - Nueva versión disponible");
          if (confirm("Nueva versión disponible. ¿Recargar ahora?")) {
            window.location.reload();
          }
        }
      });

      // Verificar cada 30 segundos
      setInterval(() => {
        this.swUpdate.checkForUpdate().then(() => {
          console.log("🔍 PWA - Verificación de actualizaciones completada");
        });
      }, 30000);
    } else {
      console.log("ℹ️ PWA - Service Worker deshabilitado (modo desarrollo)");
    }
  }
}
