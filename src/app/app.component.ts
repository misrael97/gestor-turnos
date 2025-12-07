import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SplashScreen } from "@capacitor/splash-screen";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { AlertController, ToastController } from "@ionic/angular";
import { AuthService } from "./core/services/auth.service";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  isOnline: boolean = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private swUpdate: SwUpdate,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.checkForUpdates();
    this.monitorOnlineStatus();
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

  private async checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      console.log("🔄 PWA - Service Worker activo, verificando actualizaciones...");

      // Detectar cuando hay una nueva versión disponible
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(async (event) => {
          console.log("✅ PWA - Nueva versión disponible", event);
          // Activar inmediatamente y recargar
          await this.swUpdate.activateUpdate();
          window.location.reload();
        });

      // Verificar actualizaciones al iniciar
      this.swUpdate.checkForUpdate().then(updateAvailable => {
        if (updateAvailable) {
          console.log("🔄 Actualización encontrada al iniciar");
        }
      }).catch(err => {
        console.error("❌ Error verificando actualizaciones:", err);
      });

      // Verificar actualizaciones cada 30 segundos (para desarrollo/pruebas)
      // En producción puedes cambiar a 6 horas: 6 * 60 * 60 * 1000
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 30000);
    } else {
      console.log("ℹ️ PWA - Service Worker deshabilitado (modo desarrollo)");
    }
  }

  private async promptUserToUpdate() {
    const alert = await this.alertController.create({
      header: '🔄 Actualización Disponible',
      message: 'Hay una nueva versión de la aplicación. ¿Deseas actualizar ahora?',
      buttons: [
        {
          text: 'Más tarde',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: () => {
            window.location.reload();
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }

  private monitorOnlineStatus() {
    // Detectar cuando se pierde la conexión
    window.addEventListener('offline', async () => {
      this.isOnline = false;
      console.log("📴 Sin conexión a Internet");
      await this.showOfflineToast();
    });

    // Detectar cuando se recupera la conexión
    window.addEventListener('online', async () => {
      this.isOnline = true;
      console.log("📶 Conexión restaurada");
      await this.showOnlineToast();
    });

    // Estado inicial
    this.isOnline = navigator.onLine;
    if (!this.isOnline) {
      this.showOfflineToast();
    }
  }

  private async showOfflineToast() {
    const toast = await this.toastController.create({
      message: '📴 Sin conexión. Trabajando en modo offline',
      duration: 3000,
      color: 'warning',
      position: 'bottom',
      icon: 'cloud-offline-outline'
    });
    await toast.present();
  }

  private async showOnlineToast() {
    const toast = await this.toastController.create({
      message: '📶 Conexión restaurada',
      duration: 2000,
      color: 'success',
      position: 'bottom',
      icon: 'cloud-done-outline'
    });
    await toast.present();
  }
}
