import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  form: UntypedFormGroup;
  loading = false;

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    console.log('🔍 INICIANDO LOGIN - Datos:', this.form.value);
    console.log('🌐 API URL desde AuthService:', (this.auth as any).api);

    this.auth.login(this.form.value).subscribe({
      next: async (res: any) => {
        console.log('✅ LOGIN EXITOSO - Respuesta completa:', res);
        console.log('📧 Email usado:', this.form.value.email);
        this.loading = false;
        
        // Verificar si el backend requiere 2FA
        if (res.requires_2fa || res.message?.includes('2FA') || res.message?.includes('código')) {
          
          // MODO DEBUG: Si el backend devuelve el código (solo desarrollo)
          if (res.debug_code) {
            console.warn('🔐 CÓDIGO 2FA (DEBUG):', res.debug_code);
            console.warn('⚠️ Este código solo se muestra en desarrollo');
          }
          
          // Guardar email temporalmente en localStorage como backup
          const userEmail = this.form.value.email;
          localStorage.setItem('temp_2fa_email', userEmail);
          console.log('💾 Email guardado en localStorage para 2FA:', userEmail);
          
          await this.presentToast('Código de verificación enviado a tu correo', 'success');
          
          // Redirigir a la página de verificación 2FA
          this.router.navigate(['/auth/verify-2fa'], {
            state: { email: userEmail }
          });
        } else {
          // Si el backend NO requiere 2FA (fallback para compatibilidad)
          this.auth.saveSession(res.token, res.user);
          await this.presentToast('Bienvenido ' + res.user.name, 'success');
          
          const roleName = res.user.role?.nombre || res.user.role?.name;
          const roleId = res.user.role?.id || res.user.role_id;
          console.log('👤 Usuario completo:', res.user);
          console.log('🎭 Rol completo:', res.user.role);
          console.log('🎭 Rol nombre:', roleName);
          console.log('🎭 Rol ID:', roleId);
          
          // Redirigir según el rol (por nombre o por ID)
          // role_id 1 = Administrador (Jefe máximo - Gestión), 2 = Agente (Admin de Sucursal - Operaciones), 3 = Cliente
          if (roleName === 'Administrador' || roleId === 1) {
            console.log('➡️ Redirigiendo a Administrador (Gestión de Sucursales)');
            this.router.navigate(['/admin/negocios']);
          } else if (roleName === 'Agente' || roleId === 2) {
            console.log('➡️ Redirigiendo a Agente (Mi Sucursal)');
            this.router.navigate(['/super/dashboard']);
          } else if (roleName === 'Cliente' || roleId === 3) {
            console.log('➡️ Redirigiendo a Cliente home');
            this.router.navigate(['/cliente/home']);
          } else {
            console.log('⚠️ Rol desconocido, redirigiendo a cliente por defecto');
            this.router.navigate(['/cliente/home']);
          }
        }
      },
      error: async (err) => {
        console.error('❌ ERROR EN LOGIN - Error completo:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Error body:', err.error);
        console.error('❌ URL intentada:', err.url);
        this.loading = false;
        
        let mensaje = 'Credenciales incorrectas';
        if (err.error?.message) {
          mensaje = err.error.message;
        }
        
        await this.presentToast(mensaje, 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
