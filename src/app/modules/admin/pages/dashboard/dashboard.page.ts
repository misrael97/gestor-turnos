import { Component, OnInit } from '@angular/core';
import { TurnosService } from 'src/app/core/services/turnos.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  turnos: any[] = [];
  turnoActual: any = null;
  totalTurnos = 0;

  constructor(
    private turnosService: TurnosService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.turnosService.obtenerTurnos().subscribe({
      next: (res: any) => {
        this.turnos = res;
        this.totalTurnos = res.length;
      },
      error: () => this.presentToast('Error al cargar turnos', 'danger'),
    });
  }

  llamarSiguiente() {
    this.turnosService.llamarSiguiente().subscribe({
      next: async (res: any) => {
        this.turnoActual = res.turno;
        this.presentToast(`Llamando al turno #${res.turno.id}`, 'success');
        this.cargarTurnos();
      },
      error: () => this.presentToast('No hay turnos disponibles', 'warning'),
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
