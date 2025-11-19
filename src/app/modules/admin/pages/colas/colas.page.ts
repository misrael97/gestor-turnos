import { Component, OnInit } from '@angular/core';
import { TurnosService } from 'src/app/core/services/turnos.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-colas',
  templateUrl: './colas.page.html',
  styleUrls: ['./colas.page.scss'],
})
export class ColasPage implements OnInit {
  turnos: any[] = [];
  colas = ['Caja 1', 'Caja 2', 'Atención General'];

  constructor(private turnosService: TurnosService, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.turnosService.obtenerTurnos().subscribe((res: any) => {
      this.turnos = res.filter((t: any) => t.estado === 'en espera');
    });
  }

  reasignar(turno: any, nuevaCola: string) {
    this.turnosService.crearTurno({ ...turno, cola: nuevaCola }).subscribe({
      next: () => this.presentToast(`Turno #${turno.id} reasignado a ${nuevaCola}`, 'success'),
      error: () => this.presentToast('Error al reasignar', 'danger'),
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
