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
    // ✅ Esperar a que el token se verifique antes de redirigir
    if (this.auth.isAuthenticated && this.auth.user) {
      const user = this.auth.user;
      const roleId = user.role?.id || user.role_id;

      const currentUrl = this.router.url;
      
      // ✅ NO redirigir si está en rutas públicas
      if (currentUrl.startsWith('/display-publico') || currentUrl.startsWith('/verificar-turno')) {
        return; // Permitir acceso a rutas públicas
      }
      
      // ✅ Solo redirigir si está en login o raíz
      if (currentUrl === '/' || currentUrl.startsWith('/auth')) {
        if (roleId === 1) {
          this.router.navigate(["/admin/dashboard"]);
        } else if (roleId === 2) {
          this.router.navigate(["/super/display"]);
        } else if (roleId === 3) {
          this.router.navigate(["/cliente/home"]);
        } else if (roleId === 4) {
          this.router.navigate(["/empleado/turnos"]);
        }
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
