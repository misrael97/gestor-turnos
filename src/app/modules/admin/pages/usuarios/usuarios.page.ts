import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  usuarios: any[] = [];
  sucursales: any[] = [];
  userForm: UntypedFormGroup;
  editando = false;
  usuarioEditando: any = null;
  loading = false;
  
  roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Agente' },
    { id: 3, nombre: 'Cliente' },
  ];

  private api = `${environment.apiUrl}/usuarios`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private fb: UntypedFormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role_id: [3, Validators.required],
      sucursal_id: [null]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarSucursales();
  }

  async cargarUsuarios(event?: any) {
    this.loading = true;
    console.log('📡 Cargando usuarios desde:', this.api);
    console.log('🔑 Token:', this.auth.token ? 'Presente' : 'Ausente');
    
    this.http.get(this.api, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.usuarios = res;
        this.loading = false;
        console.log('✅ Usuarios cargados:', res);
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
        this.loading = false;
        if (event) event.target.complete();
        
        if (err.status === 404) {
          console.warn('⚠️ La ruta GET /api/usuarios no existe en el backend');
          this.presentToast('Endpoint no encontrado - contacta al administrador', 'warning');
        } else if (err.status === 401) {
          console.warn('⚠️ No autorizado - Token inválido o expirado');
          this.presentToast('Sesión expirada', 'danger');
        } else if (err.status === 403) {
          console.warn('⚠️ Acceso prohibido - No tienes permisos para ver usuarios');
          this.presentToast('No tienes permisos', 'danger');
        }
        
        this.usuarios = [];
      }
    });
  }

  async cargarSucursales() {
    this.http.get(`${environment.apiUrl}/negocios`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.sucursales = res;
        console.log('✅ Sucursales cargadas:', res);
      },
      error: (err) => {
        console.error('❌ Error al cargar sucursales:', err);
        this.sucursales = [];
      }
    });
  }

  async crearUsuario() {
    if (this.userForm.invalid) {
      await this.presentToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loader.present();

    if (this.editando && this.usuarioEditando) {
      // Actualizar usuario existente
      const payload = { ...this.userForm.value };
      if (!payload.password) delete payload.password; // No enviar password si está vacío

      this.http.put(`${this.api}/${this.usuarioEditando.id}`, payload, { headers: this.auth.headers }).subscribe({
        next: async () => {
          await loader.dismiss();
          await this.presentToast('Usuario actualizado correctamente', 'success');
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: async (err) => {
          await loader.dismiss();
          console.error('Error al actualizar usuario:', err);
          await this.presentToast('Error al actualizar usuario', 'danger');
        }
      });
    } else {
      // Crear nuevo usuario
      console.log('📤 Creando nuevo usuario:', this.userForm.value);
      
      this.http.post(this.api, this.userForm.value, { headers: this.auth.headers }).subscribe({
        next: async (response: any) => {
          await loader.dismiss();
          console.log('✅ Usuario creado exitosamente. Respuesta del servidor:', response);
          console.log('🆔 ID del usuario creado:', response?.id || response?.data?.id);
          
          await this.presentToast('Usuario creado correctamente', 'success');
          
          // Asegurarse de que NO estamos en modo edición
          this.editando = false;
          this.usuarioEditando = null;
          
          // Resetear formulario completamente
          this.userForm.reset({ 
            role_id: 3,
            sucursal_id: null,
            name: '',
            email: '',
            password: ''
          });
          
          console.log('🔄 Formulario reseteado. Estado editando:', this.editando);
          
          this.cargarUsuarios();
        },
        error: async (err) => {
          await loader.dismiss();
          console.error('❌ Error al crear usuario:', err);
          console.error('❌ Detalles del error:', err.error);
          await this.presentToast('Error al crear usuario', 'danger');
        }
      });
    }
  }

  editarUsuario(usuario: any) {
    console.log('✏️ Editando usuario:', usuario);
    
    this.editando = true;
    this.usuarioEditando = usuario;
    this.userForm.patchValue({
      name: usuario.name,
      email: usuario.email,
      password: '', // No mostrar password existente
      role_id: usuario.role_id,
      sucursal_id: usuario.sucursal_id || null
    });
    // Hacer password opcional en modo edición
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    console.log('📝 Formulario cargado con datos del usuario ID:', usuario.id);
    console.log('📝 Modo edición activado:', this.editando);
  }

  cancelarEdicion() {
    console.log('❌ Cancelando edición');
    
    this.editando = false;
    this.usuarioEditando = null;
    this.userForm.reset({ 
      role_id: 3,
      sucursal_id: null,
      name: '',
      email: '',
      password: ''
    });
    
    // Restaurar validación de password como requerida
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
    
    console.log('🔄 Modo edición desactivado. Estado editando:', this.editando);
  }

  async confirmarEliminar(usuario: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario "${usuario.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminarUsuario(usuario.id)
        }
      ]
    });
    await alert.present();
  }

  async eliminarUsuario(id: number) {
    const loader = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loader.present();

    this.http.delete(`${this.api}/${id}`, { headers: this.auth.headers }).subscribe({
      next: async () => {
        await loader.dismiss();
        await this.presentToast('Usuario eliminado correctamente', 'success');
        this.cargarUsuarios();
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al eliminar usuario:', err);
        await this.presentToast('Error al eliminar usuario', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
