import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  form: UntypedFormGroup;
  loading = false;

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      await this.presentToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    this.loading = true;
    console.log('Datos de registro:', this.form.value);

    this.auth.register(this.form.value).subscribe({
      next: async (res: any) => {
        console.log('Registro exitoso:', res);
        this.loading = false;
        this.auth.saveSession(res.token, res.user);
        await this.presentToast('Cuenta creada correctamente', 'success');
        
        // Usar role.nombre en lugar de role.name
        const roleName = res.user.role?.nombre || res.user.role?.name;
        if (roleName === 'SuperAdmin') {
          this.router.navigate(['/super/negocios']);
        } else if (roleName === 'AdminSucursal') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/cliente/home']);
        }
      },
      error: async (err) => {
        console.error('Error al registrar:', err);
        console.error('Detalles del error:', err.error);
        this.loading = false;
        
        // Manejar errores específicos
        let mensaje = 'Error al registrarte';
        
        if (err.status === 422) {
          // Error de validación
          if (err.error?.errors?.email) {
            mensaje = 'Este correo electrónico ya está registrado';
          } else if (err.error?.message) {
            mensaje = err.error.message;
          } else if (err.error?.errors) {
            // Mostrar el primer error de validación
            const primerError = Object.values(err.error.errors)[0];
            mensaje = Array.isArray(primerError) ? primerError[0] : primerError;
          }
        } else if (err.status === 500) {
          mensaje = 'Error del servidor. Intenta más tarde';
        }
        
        await this.presentToast(mensaje, 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 3000, 
      color 
    });
    await toast.present();
  }
}