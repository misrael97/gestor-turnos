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
      horario: ['']
    });
  }

  ngOnInit() {
    this.cargarNegocios();
  }

  async cargarNegocios() {
    this.loading = true;
    this.http.get(this.api, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.negocios = res;
        this.loading = false;
        console.log('✅ Negocios cargados:', res);
      },
      error: async (err) => {
        console.error('❌ Error al cargar negocios:', err);
        this.loading = false;
        if (err.status === 404) {
          this.negocios = [];
          await this.presentToast('⚠️ Endpoint no implementado aún', 'warning');
        } else {
          await this.presentToast('Error al cargar negocios', 'danger');
        }
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
      horario: negocio.horario
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
