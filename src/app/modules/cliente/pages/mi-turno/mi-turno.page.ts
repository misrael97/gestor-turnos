import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-mi-turno',
  templateUrl: './mi-turno.page.html',
  styleUrls: ['./mi-turno.page.scss'],
})
export class MiTurnoPage implements OnInit, OnDestroy {
  turno: any = null;
  qrData: string = '';
  posicion: number = 0;
  turnosDelante: number = 0;
  loading = false;
  confirmando = false;
  cancelando = false;
  descargandoPDF = false;
  
  private refreshSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarMiTurno();
    
    // Auto-refresh cada 10 segundos
    this.refreshSubscription = interval(10000).subscribe(() => {
      this.cargarMiTurno(true);
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  cargarMiTurno(silent = false) {
    if (!silent) this.loading = true;
    
    const usuarioId = this.auth.user?.id;
    console.log('👤 ID del usuario autenticado:', usuarioId);
    
    if (!usuarioId) {
      console.error('❌ No se encontró el ID del usuario autenticado');
      this.loading = false;
      return;
    }
    
    this.http.get(`${environment.apiUrl}/turnos`, { headers: this.auth.headers })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          console.log('📋 Respuesta completa de turnos:', res);
          
          const turnos = Array.isArray(res) ? res : (res.data || []);
          console.log('📋 Turnos procesados:', turnos);
          console.log('📋 Estados de turnos:', turnos.map(t => ({ id: t.id, usuario_id: t.usuario_id, estado: t.estado })));
          
          // FILTRAR solo los turnos del usuario autenticado
          const misTurnos = turnos.filter(t => t.usuario_id === usuarioId);
          console.log(`📋 Mis turnos (usuario_id: ${usuarioId}):`, misTurnos);
          
          // Obtener el turno activo del usuario (NO atendido, NO cancelado)
          this.turno = misTurnos.find(t => 
            t.estado !== 'atendido' && 
            t.estado !== 'cancelado' &&
            t.estado !== 'completado'
          );
          
          console.log('📋 Turno activo encontrado:', this.turno);
          
          if (this.turno) {
            this.calcularPosicion(misTurnos);
            this.generarQR();
          } else {
            console.log('⚠️ No se encontró turno activo. Mis turnos:', misTurnos.length);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Error al cargar turno:', err);
          console.error('❌ Status:', err.status);
          console.error('❌ Mensaje:', err.error);
        }
      });
  }

  calcularPosicion(todosTurnos: any[]) {
    // Filtrar turnos de la misma cola que no están atendidos/cancelados
    const turnosMismaCola = todosTurnos.filter(t => 
      t.cola === this.turno.cola && 
      t.estado !== 'atendido' && 
      t.estado !== 'cancelado' &&
      t.estado !== 'completado' &&
      new Date(t.created_at) < new Date(this.turno.created_at)
    );
    
    this.turnosDelante = turnosMismaCola.length;
    this.posicion = this.turnosDelante + 1;
    
    console.log('📊 Posición calculada:', {
      cola: this.turno.cola,
      turnosDelante: this.turnosDelante,
      posicion: this.posicion,
      totalEnCola: turnosMismaCola.length + 1
    });
  }

  generarQR() {
    const baseUrl = window.location.origin;
    const turnoData = {
      turno_id: this.turno.id,
      numero: this.turno.numero || this.turno.id,
      sucursal_id: this.turno.sucursal_id,
      fecha: this.turno.fecha_programada || new Date().toISOString().split('T')[0],
      hora: this.turno.hora_programada || '',
      tipo: this.turno.tipo
    };
    
    const dataParam = encodeURIComponent(JSON.stringify(turnoData));
    this.qrData = `${baseUrl}/verificar-turno?data=${dataParam}`;
    console.log('📱 QR generado:', this.qrData);
  }

  async confirmarTurno() {
    if (!this.turno) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Asistencia',
      message: '¿Confirmas que asistirás a tu turno?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Confirmar', 
          handler: () => this.ejecutarConfirmacion() 
        }
      ]
    });
    await alert.present();
  }

  async ejecutarConfirmacion() {
    const loader = await this.loadingCtrl.create({ message: 'Confirmando...' });
    await loader.present();

    this.http.put(`${environment.apiUrl}/turnos/${this.turno.id}/confirmar`, 
      {}, 
      { headers: this.auth.headers }
    ).subscribe({
      next: async () => {
        await loader.dismiss();
        await this.presentToast('Turno confirmado correctamente', 'success');
        this.cargarMiTurno();
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al confirmar:', err);
        await this.presentToast('Error al confirmar turno', 'danger');
      }
    });
  }

  async cancelarTurno() {
    if (!this.turno) return;

    const alert = await this.alertCtrl.create({
      header: 'Cancelar Turno',
      message: '¿Estás seguro de cancelar tu turno? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'No', role: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          role: 'destructive',
          handler: () => this.ejecutarCancelacion() 
        }
      ]
    });
    await alert.present();
  }

  async ejecutarCancelacion() {
    this.cancelando = true;

    this.http.put(`${environment.apiUrl}/turnos/${this.turno.id}/cancelar`, 
      {}, 
      { headers: this.auth.headers }
    ).subscribe({
      next: async () => {
        this.cancelando = false;
        await this.presentToast('✓ Turno cancelado', 'warning');
        this.navCtrl.navigateRoot('/cliente/home');
      },
      error: async (err) => {
        this.cancelando = false;
        console.error('Error al cancelar:', err);
        await this.presentToast('Error al cancelar turno', 'danger');
      }
    });
  }

  async descargarPDF() {
    if (!this.turno) return;

    const loader = await this.loadingCtrl.create({ message: 'Generando PDF...' });
    await loader.present();

    this.http.get(`${environment.apiUrl}/turnos/${this.turno.id}/pdf`, {
      headers: this.auth.headers,
      responseType: 'blob'
    }).subscribe({
      next: async (blob: Blob) => {
        await loader.dismiss();
        
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `turno_${this.turno.numero || this.turno.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        await this.presentToast('PDF descargado', 'success');
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al descargar PDF:', err);
        await this.presentToast('Error al generar PDF', 'danger');
      }
    });
  }

  async descargarQR() {
    if (!this.turno) return;

    try {
      // Obtener el canvas del QR
      const canvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
      
      if (!canvas) {
        await this.presentToast('No se pudo generar el QR', 'warning');
        return;
      }

      // Convertir canvas a blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          await this.presentToast('Error al generar imagen', 'danger');
          return;
        }

        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr_turno_${this.turno.numero || this.turno.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        await this.presentToast('QR descargado correctamente', 'success');
      }, 'image/png');
    } catch (error) {
      console.error('Error al descargar QR:', error);
      await this.presentToast('Error al descargar QR', 'danger');
    }
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000, 
      color 
    });
    await toast.present();
  }
}
