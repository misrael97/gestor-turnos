import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

declare var Html5Qrcode: any;

@Component({
  selector: 'app-escanear-qr',
  templateUrl: './escanear-qr.page.html',
  styleUrls: ['./escanear-qr.page.scss'],
})
export class EscanearQrPage implements OnInit, OnDestroy {
  escaneando = false;
  permisoCamara = false;
  html5QrCode: any;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.verificarPermisoCamara();
  }

  ngOnDestroy() {
    this.detenerEscaneo();
  }

  async verificarPermisoCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      this.permisoCamara = true;
    } catch (error) {
      console.error('Error al verificar permiso de cámara:', error);
      this.permisoCamara = false;
      
      const alert = await this.alertCtrl.create({
        header: 'Permiso Requerido',
        message: 'Se necesita acceso a la cámara para escanear códigos QR',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async iniciarEscaneo() {
    if (!this.permisoCamara) {
      await this.verificarPermisoCamara();
      if (!this.permisoCamara) return;
    }

    this.escaneando = true;
    
    // Esperar a que Angular renderice el elemento qr-reader
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      this.html5QrCode = new Html5Qrcode("qr-reader");
      
      await this.html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText: string) => {
          console.log('✅ QR escaneado:', decodedText);
          this.procesarQR(decodedText);
          this.detenerEscaneo();
        },
        (errorMessage: string) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (error) {
      console.error('❌ Error al iniciar escaneo:', error);
      await this.presentToast('Error al acceder a la cámara', 'danger');
      this.escaneando = false;
    }
  }

  async detenerEscaneo() {
    if (this.html5QrCode && this.escaneando) {
      try {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
      } catch (error) {
        console.error('Error al detener escaneo:', error);
      }
    }
    this.escaneando = false;
  }

  async procesarQR(contenido: string) {
    const loader = await this.loadingCtrl.create({ message: 'Validando turno...' });
    await loader.present();

    try {
      // El QR contiene una URL con el formato: /verificar-turno?data=...
      const url = new URL(contenido);
      const dataParam = url.searchParams.get('data');
      
      if (!dataParam) {
        throw new Error('QR inválido');
      }

      const turnoData = JSON.parse(decodeURIComponent(dataParam));
      console.log('📱 Datos del turno:', turnoData);

      // Validar el turno con el backend
      this.http.post(`${environment.apiUrl}/turnos/validar-qr`, {
        turno_id: turnoData.turno_id,
        numero: turnoData.numero,
        sucursal_id: turnoData.sucursal_id
      }, { headers: this.auth.headers }).subscribe({
        next: async (res: any) => {
          await loader.dismiss();
          const turno = res.data || res.turno || res;
          
          // Mostrar confirmación para atender el turno
          await this.confirmarAtencion(turno);
        },
        error: async (err) => {
          await loader.dismiss();
          console.error('Error al validar QR:', err);
          await this.presentToast(err.error?.message || 'Turno no válido', 'danger');
        }
      });
    } catch (error) {
      await loader.dismiss();
      console.error('Error al procesar QR:', error);
      await this.presentToast('Código QR inválido', 'danger');
    }
  }

  async confirmarAtencion(turno: any) {
    const alert = await this.alertCtrl.create({
      header: 'Turno Escaneado',
      message: `
        <strong>Turno #${turno.numero || turno.id}</strong><br>
        Cliente: ${turno.user?.name || 'Sin nombre'}<br>
        Estado: ${turno.estado}<br><br>
        ¿Marcar como atendido?
      `,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Atender',
          handler: () => this.atenderTurno(turno.id)
        }
      ]
    });
    await alert.present();
  }

  async atenderTurno(turnoId: number) {
    const loader = await this.loadingCtrl.create({ message: 'Atendiendo turno...' });
    await loader.present();

    this.http.put(`${environment.apiUrl}/turnos/${turnoId}`, 
      { estado: 'atendido' },
      { headers: this.auth.headers }
    ).subscribe({
      next: async () => {
        await loader.dismiss();
        await this.presentToast('✅ Turno atendido correctamente', 'success');
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al atender turno:', err);
        await this.presentToast('Error al marcar turno como atendido', 'danger');
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
