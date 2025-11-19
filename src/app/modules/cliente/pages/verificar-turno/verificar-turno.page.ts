import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-verificar-turno',
  templateUrl: './verificar-turno.page.html',
  styleUrls: ['./verificar-turno.page.scss'],
})
export class VerificarTurnoPage implements OnInit {
  turno: any = null;
  loading = true;
  error = false;
  qrData: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const qrParam = this.route.snapshot.queryParamMap.get('data');
    
    if (qrParam) {
      try {
        this.qrData = JSON.parse(decodeURIComponent(qrParam));
        console.log('Datos del QR:', this.qrData);
        this.verificarTurno();
      } catch (error) {
        console.error('Error al parsear datos del QR:', error);
        this.error = true;
        this.loading = false;
        this.mostrarError('Código QR inválido');
      }
    } else {
      this.error = true;
      this.loading = false;
      this.mostrarError('No se encontraron datos del turno');
    }
  }

  verificarTurno() {
    if (!this.qrData || !this.qrData.turno_id) {
      this.error = true;
      this.loading = false;
      return;
    }

    // Usar el endpoint POST /api/turnos/validar-qr
    this.http.post(`${environment.apiUrl}/turnos/validar-qr`, {
      turno_id: this.qrData.turno_id,
      numero: this.qrData.numero,
      sucursal_id: this.qrData.sucursal_id
    }).subscribe({
      next: (res: any) => {
        console.log('✅ Turno verificado:', res);
        this.turno = res.data || res.turno || res;
        this.loading = false;
        
        if (this.turno.estado === 'cancelado') {
          this.mostrarAdvertencia('Este turno ha sido cancelado');
        } else if (this.turno.estado === 'atendido') {
          this.mostrarAdvertencia('Este turno ya fue atendido');
        } else if (this.turno.valido) {
          this.mostrarExito('Turno válido');
        }
      },
      error: (err) => {
        console.error('❌ Error al verificar turno:', err);
        this.error = true;
        this.loading = false;
        this.mostrarError(err.error?.message || 'No se pudo verificar el turno');
      }
    });
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 4000,
      color: 'danger'
    });
    await toast.present();
  }

  async mostrarAdvertencia(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 4000,
      color: 'warning'
    });
    await toast.present();
  }

  async mostrarExito(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'espera':
      case 'pendiente':
        return 'warning';
      case 'en_atencion':
      case 'llamado':
        return 'primary';
      case 'atendido':
        return 'success';
      case 'cancelado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'espera':
      case 'pendiente':
        return 'En Espera';
      case 'en_atencion':
      case 'llamado':
        return 'Llamado';
      case 'atendido':
        return 'Atendido';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }
}
