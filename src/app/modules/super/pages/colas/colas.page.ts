import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-colas',
  templateUrl: './colas.page.html',
  styleUrls: ['./colas.page.scss'],
})
export class ColasPage implements OnInit {
  turnos: any[] = [];
  colas = ['Caja 1', 'Caja 2', 'Atención General', 'Servicios'];
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  async cargarTurnos(event?: any) {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/turnos`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.turnos = res.filter((t: any) => t.estado === 'en espera' || t.estado === 'llamado');
        this.loading = false;
        if (event) event.target.complete();
      },
      error: async (err) => {
        console.error('Error al cargar turnos:', err);
        this.loading = false;
        if (event) event.target.complete();
        await this.presentToast('Error al cargar turnos', 'danger');
      }
    });
  }

  async reasignarCola(turno: any) {
    const alert = await this.alertCtrl.create({
      header: 'Reasignar a Cola',
      message: `¿A qué cola deseas reasignar el turno #${turno.numero || turno.id}?`,
      inputs: this.colas.map(cola => ({
        type: 'radio',
        label: cola,
        value: cola
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reasignar',
          handler: (nuevaCola) => {
            if (nuevaCola) {
              this.ejecutarReasignacion(turno.id, nuevaCola);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async ejecutarReasignacion(turnoId: number, nuevaCola: string) {
    const loader = await this.loadingCtrl.create({ message: 'Reasignando...' });
    await loader.present();

    this.http.put(`${environment.apiUrl}/turnos/${turnoId}/reasignar`, 
      { cola: nuevaCola }, 
      { headers: this.auth.headers }
    ).subscribe({
      next: async () => {
        await loader.dismiss();
        await this.presentToast(`Turno reasignado a ${nuevaCola}`, 'success');
        this.cargarTurnos();
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al reasignar:', err);
        await this.presentToast('Error al reasignar turno', 'danger');
      }
    });
  }

  getTurnosPorCola(cola: string) {
    return this.turnos.filter(t => t.cola === cola);
  }

  get turnosSinCola() {
    return this.turnos.filter(t => !t.cola);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
