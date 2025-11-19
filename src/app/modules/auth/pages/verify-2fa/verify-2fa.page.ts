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
    
    console.log('🔍 Verify2FA - Estado de navegación:', state);
    console.log('🔍 Verify2FA - Navigation completo:', navigation);
    
    this.email = state?.email || '';
    
    // Si no hay email en el estado, intentar obtenerlo de localStorage como backup
    if (!this.email) {
      this.email = localStorage.getItem('temp_2fa_email') || '';
      console.log('📦 Email obtenido de localStorage:', this.email);
    }
    
    console.log('📧 Email final para 2FA:', this.email);
    
    if (!this.email) {
      // Si no hay email, redirigir al login
      console.error('❌ No hay email disponible, redirigiendo a login');
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
    console.log('🔐 Verificando código 2FA');
    console.log('Email:', this.email);
    console.log('Código ingresado:', code);
    console.log('Longitud del código:', code.length);

    this.auth.verify2FA(this.email, code).subscribe({
      next: async (res: any) => {
        console.log('✅ 2FA verificado exitosamente:', res);
        this.loading = false;
        
        // Limpiar email temporal de localStorage
        localStorage.removeItem('temp_2fa_email');
        console.log('🗑️ Email temporal eliminado de localStorage');
        
        // Guardar sesión con el token
        this.auth.saveSession(res.token, res.user);
        await this.presentToast('Autenticación exitosa', 'success');
        
        // Redirigir según el rol
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
    console.log('Reenviando código 2FA a:', this.email);

    this.auth.resend2FA(this.email).subscribe({
      next: async (res: any) => {
        console.log('Código reenviado:', res);
        this.resendLoading = false;
        await this.presentToast('Código reenviado a tu correo', 'success');
        this.startCountdown();
      },
      error: async (err) => {
        console.error('Error al reenviar código:', err);
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
