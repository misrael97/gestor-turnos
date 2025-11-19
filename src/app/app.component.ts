import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen'
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.initializeApp();
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
      
      console.log('👤 Usuario autenticado detectado:', { roleName, roleId });
      
      // No redirigir si ya está en una ruta válida de su módulo
      const currentUrl = this.router.url;
      
      if (roleId === 1 && !currentUrl.startsWith('/admin')) {
        // Administrador
        console.log('🔄 Redirigiendo a módulo Admin');
        this.router.navigate(['/admin/dashboard']);
      } else if (roleId === 2 && !currentUrl.startsWith('/super')) {
        // Agente
        console.log('🔄 Redirigiendo a módulo Agente');
        this.router.navigate(['/super/turnos']);
      } else if (roleId === 3 && !currentUrl.startsWith('/cliente')) {
        // Cliente
        console.log('🔄 Redirigiendo a módulo Cliente');
        this.router.navigate(['/cliente/home']);
      }
    }
  }
}
