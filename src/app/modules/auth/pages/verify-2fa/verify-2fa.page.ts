import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-verify-2fa',
  templateUrl: './verify-2fa.page.html',
  styleUrls: ['./verify-2fa.page.scss'],
})
export class Verify2faPage implements OnInit {
  form: UntypedFormGroup;
  loading = false;
  email: string = '';
  resendLoading = false;
  countdown = 60;
  countdownInterval: any;

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // Obtener email del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    
    this.email = state?.email || '';
    
    // Si no hay email en el estado, intentar obtenerlo de localStorage como backup
    if (!this.email) {
      this.email = localStorage.getItem('temp_2fa_email') || '';
    }
    
    if (!this.email) {
      // Si no hay email, redirigir al login
      this.router.navigate(['/auth/login']);
      return;
    }

    // Iniciar contador para reenvío
    this.startCountdown();
  }

  startCountdown() {
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  async onSubmit() {
    if (this.form.invalid) {
      await this.presentToast('Por favor ingresa el código de 6 dígitos', 'warning');
      return;
    }

    this.loading = true;
    const code = this.form.value.code;

    this.auth.verify2FA(this.email, code).subscribe({
      next: async (res: any) => {
        this.loading = false;
        
        // Limpiar email temporal de localStorage
        localStorage.removeItem('temp_2fa_email');
        
        // Guardar sesión con el token
        this.auth.saveSession(res.token, res.user);
        await this.presentToast('Autenticación exitosa', 'success');
        
        // Redirigir según el rol
        const roleId = res.user.role?.id || res.user.role_id;
        
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
      },
      error: async (err) => {
        console.error('❌ Error al verificar 2FA');
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('Error completo:', err);
        console.error('Error body:', err.error);
        console.error('Errores de validación:', err.error?.errors);
        
        this.loading = false;
        
        let mensaje = 'Código incorrecto';
        
        // Manejar errores específicos del backend
        if (err.error?.error) {
          mensaje = err.error.error;
        } else if (err.error?.message) {
          mensaje = err.error.message;
        } else if (err.error?.errors) {
          // Mostrar errores de validación
          const errores = err.error.errors;
          console.error('Errores de validación detallados:', errores);
          
          if (errores.email) {
            mensaje = Array.isArray(errores.email) ? errores.email[0] : errores.email;
          } else if (errores.code) {
            mensaje = Array.isArray(errores.code) ? errores.code[0] : errores.code;
          } else {
            const primerError = Object.values(errores)[0];
            mensaje = Array.isArray(primerError) ? primerError[0] : primerError;
          }
        } else if (err.status === 401) {
          mensaje = 'Código incorrecto o expirado';
        } else if (err.status === 422) {
          mensaje = 'Datos inválidos. Verifica el código y tu email.';
        } else if (err.status === 404) {
          mensaje = 'Usuario no encontrado';
        }
        
        console.warn('⚠️ Mensaje mostrado al usuario:', mensaje);
        await this.presentToast(mensaje, 'danger');
        
        // Limpiar el código
        this.form.patchValue({ code: '' });
      }
    });
  }

  async resendCode() {
    if (this.countdown > 0) {
      await this.presentToast(`Espera ${this.countdown} segundos para reenviar`, 'warning');
      return;
    }

    this.resendLoading = true;

    this.auth.resend2FA(this.email).subscribe({
      next: async (res: any) => {
        this.resendLoading = false;
        await this.presentToast('Código reenviado a tu correo', 'success');
        this.startCountdown();
      },
      error: async (err) => {
        this.resendLoading = false;
        await this.presentToast('Error al reenviar el código', 'danger');
      }
    });
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 3000, 
      color 
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
