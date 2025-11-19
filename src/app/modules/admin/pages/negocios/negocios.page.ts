import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-negocios',
  templateUrl: './negocios.page.html',
  styleUrls: ['./negocios.page.scss'],
})
export class NegociosPage implements OnInit {
  negocios: any[] = [];
  agentes: any[] = [];
  negocioForm: UntypedFormGroup;
  api = `${environment.apiUrl}/negocios`;
  editando = false;
  negocioEditando: any = null;
  loading = false;

  constructor(
    private http: HttpClient,
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.negocioForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: [''],
      horario: [''],
      agente_id: [null]
    });
  }

  ngOnInit() {
    this.cargarNegocios();
    this.cargarAgentes();
  }

  async cargarNegocios() {
    this.loading = true;
    
    const usuario = this.auth.user;
    const adminId = usuario?.id;
    const esAdmin = usuario?.role_id === 1;
    
    console.log('👤 Admin - Usuario ID:', adminId);
    console.log('👤 Admin - Rol ID:', usuario?.role_id);
    
    if (!adminId) {
      console.error('❌ No se encontró el ID del administrador');
      this.loading = false;
      return;
    }
    
    this.http.get(this.api, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        const todosNegocios = Array.isArray(res) ? res : (res.data || []);
        console.log('📋 Total de negocios en el sistema:', todosNegocios.length);
        
        // FILTRAR solo negocios de este administrador
        // Verificar si el backend tiene admin_id, usuario_id o similar
        if (esAdmin) {
          this.negocios = todosNegocios.filter(n => 
            n.admin_id === adminId || 
            n.usuario_id === adminId ||
            n.creado_por === adminId ||
            n.propietario_id === adminId
          );
          
          // Si no hay ningún campo de propietario, mostrar todos por ahora
          // (el backend deberá implementar esta lógica)
          if (this.negocios.length === 0 && todosNegocios.length > 0) {
            console.warn('⚠️ Los negocios no tienen campo de propietario. Mostrando todos.');
            console.warn('⚠️ El backend debe agregar admin_id o usuario_id a la tabla negocios');
            this.negocios = todosNegocios;
          }
          
          console.log('📋 Mis negocios (admin_id:', adminId + '):', this.negocios.length);
        } else {
          // No es admin, mostrar todos (SuperAdmin)
          this.negocios = todosNegocios;
        }
        
        this.loading = false;
        console.log('✅ Negocios cargados:', this.negocios);
      },
      error: async (err) => {
        console.error('❌ Error al cargar negocios:', err);
        this.negocios = [];
        this.loading = false;
        if (err.status === 404) {
          await this.presentToast('⚠️ Endpoint no implementado aún', 'warning');
        } else {
          await this.presentToast('Error al cargar negocios', 'danger');
        }
      }
    });
  }

  async cargarAgentes() {
    const usuario = this.auth.user;
    const adminId = usuario?.id;
    
    this.http.get(`${environment.apiUrl}/usuarios`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        const todosUsuarios = Array.isArray(res) ? res : (res.data || []);
        
        // Filtrar solo agentes (role_id = 2)
        let agentes = todosUsuarios.filter(u => u.role_id === 2);
        console.log('📋 Total de agentes en el sistema:', agentes.length);
        
        // OPCIONAL: Filtrar solo agentes de sucursales del admin
        // Si el backend implementa que los agentes tengan relación con el admin
        const misNegociosIds = this.negocios.map(n => n.id);
        if (misNegociosIds.length > 0) {
          const agentesDelAdmin = agentes.filter(a => 
            misNegociosIds.includes(a.sucursal_id) || 
            misNegociosIds.includes(a.negocio_id)
          );
          
          // Si hay agentes filtrados, usarlos. Si no, mostrar todos los agentes disponibles
          this.agentes = agentesDelAdmin.length > 0 ? agentesDelAdmin : agentes;
          console.log('📋 Agentes de mis sucursales:', this.agentes.length);
        } else {
          this.agentes = agentes;
        }
        
        console.log('✅ Agentes cargados:', this.agentes);
      },
      error: (err) => {
        console.error('❌ Error al cargar agentes:', err);
        this.agentes = [];
      }
    });
  }

  async crearNegocio() {
    if (this.negocioForm.invalid) {
      await this.presentToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando negocio...'
    });
    await loading.present();

    const datos = this.negocioForm.value;

    if (this.editando && this.negocioEditando) {
      // Actualizar
      this.http.put(`${this.api}/${this.negocioEditando.id}`, datos, { headers: this.auth.headers }).subscribe({
        next: async () => {
          await loading.dismiss();
          await this.presentToast('Negocio actualizado correctamente', 'success');
          this.cancelarEdicion();
          this.cargarNegocios();
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Error:', err);
          await this.presentToast('Error al actualizar negocio', 'danger');
        }
      });
    } else {
      // Crear
      this.http.post(this.api, datos, { headers: this.auth.headers }).subscribe({
        next: async () => {
          await loading.dismiss();
          await this.presentToast('Negocio creado correctamente', 'success');
          this.negocioForm.reset();
          this.cargarNegocios();
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Error:', err);
          await this.presentToast('Error al crear negocio', 'danger');
        }
      });
    }
  }

  editarNegocio(negocio: any) {
    this.editando = true;
    this.negocioEditando = negocio;
    this.negocioForm.patchValue({
      nombre: negocio.nombre,
      direccion: negocio.direccion,
      telefono: negocio.telefono,
      horario: negocio.horario,
      agente_id: negocio.agente_id || null
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.negocioEditando = null;
    this.negocioForm.reset();
  }

  async confirmarEliminar(negocio: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el negocio "${negocio.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarNegocio(negocio.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarNegocio(id: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando...'
    });
    await loading.present();

    this.http.delete(`${this.api}/${id}`, { headers: this.auth.headers }).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.presentToast('Negocio eliminado', 'success');
        this.cargarNegocios();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error:', err);
        await this.presentToast('Error al eliminar negocio', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
