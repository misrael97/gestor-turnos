import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage implements OnInit {
  reportes: any = {};
  reportesDia: any = {};
  reportesEspera: any = {};
  reportesProductividad: any = {};
  loading = false;
  error = false;
  segmentValue = 'globales'; // globales, dia, espera, productividad

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarReportes();
  }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
    
    switch(this.segmentValue) {
      case 'dia':
        if (!this.reportesDia.turnos) this.cargarReportesDia();
        break;
      case 'espera':
        if (!this.reportesEspera.promedioEspera) this.cargarReportesEspera();
        break;
      case 'productividad':
        if (!this.reportesProductividad.eficiencia) this.cargarReportesProductividad();
        break;
    }
  }

  async cargarReportes(event?: any) {
    this.loading = true;
    this.error = false;
    
    console.log('📊 Cargando reportes globales...');
    
    this.http.get(`${environment.apiUrl}/reportes-globales`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.reportes = res;
        this.loading = false;
        console.log('✅ Reportes globales:', res);
        if (event) event.target.complete();
      },
      error: async (err) => {
        console.error('❌ Error reportes globales:', err);
        this.loading = false;
        this.error = true;
        if (event) event.target.complete();
        
        if (err.status === 404) {
          await this.presentToast('Endpoint de reportes no implementado', 'warning');
          this.reportes = { totalTurnos: 0, turnosHoy: 0, usuariosActivos: 0, turnosPendientes: 0 };
        }
      }
    });
  }

  cargarReportesDia() {
    this.http.get(`${environment.apiUrl}/reportes/dia`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.reportesDia = res;
        console.log('📅 Reportes del día:', res);
      },
      error: (err) => {
        console.error('Error reportes día:', err);
        this.reportesDia = { turnos: 0, atendidos: 0, cancelados: 0, pendientes: 0 };
      }
    });
  }

  cargarReportesEspera() {
    this.http.get(`${environment.apiUrl}/reportes/espera`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.reportesEspera = res;
        console.log('⏱️ Reportes de espera:', res);
      },
      error: (err) => {
        console.error('Error reportes espera:', err);
        this.reportesEspera = { promedioEspera: 0, tiempoMinimo: 0, tiempoMaximo: 0 };
      }
    });
  }

  cargarReportesProductividad() {
    this.http.get(`${environment.apiUrl}/reportes/productividad`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.reportesProductividad = res;
        console.log('📈 Reportes productividad:', res);
      },
      error: (err) => {
        console.error('Error reportes productividad:', err);
        this.reportesProductividad = { eficiencia: 0, turnosPorHora: 0, tasaCancelacion: 0 };
      }
    });
  }

  async descargarPDF(tipo: string) {
    this.http.get(`${environment.apiUrl}/reportes/pdf/${tipo}`, {
      headers: this.auth.headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.presentToast('PDF descargado', 'success');
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        this.presentToast('Error al generar PDF', 'danger');
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
