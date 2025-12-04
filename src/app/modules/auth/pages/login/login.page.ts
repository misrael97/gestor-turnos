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

    this.auth.login(this.form.value).subscribe({
      next: async (res: any) => {
        this.loading = false;
        
        // Verificar si el backend requiere 2FA
        if (res.requires_2fa || res.message?.includes('2FA') || res.message?.includes('código')) {
          
          // Guardar email temporalmente en localStorage como backup
          const userEmail = this.form.value.email;
          localStorage.setItem('temp_2fa_email', userEmail);
          
          await this.presentToast('Código de verificación enviado a tu correo', 'success');
          
          // Redirigir a la página de verificación 2FA
          this.router.navigate(['/auth/verify-2fa'], {
            state: { email: userEmail }
          });
        } else {
          // Si el backend NO requiere 2FA (fallback para compatibilidad)
          this.auth.saveSession(res.token, res.user);
          await this.presentToast('Bienvenido ' + res.user.name, 'success');
          
          const roleId = res.user.role?.id || res.user.role_id;
          
          // Redirigir según el rol
          if (roleId === 1) {
            this.router.navigate(['/admin/negocios']);
          } else if (roleId === 2) {
            this.router.navigate(['/super/dashboard']);
          } else if (roleId === 3) {
            this.router.navigate(['/cliente/home']);
          } else if (roleId === 4) {
            this.router.navigate(['/empleado/turnos']);
          } else {
            this.router.navigate(['/cliente/home']);
          }
        }
      },
      error: async (err) => {
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
