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
  loading = false;
  error = false;

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarReportes();
  }

  async cargarReportes(event?: any) {
    this.loading = true;
    this.error = false;
    
    console.log('📊 Cargando reportes desde:', `${environment.apiUrl}/reportes-globales`);
    
    this.http.get(`${environment.apiUrl}/reportes-globales`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        this.reportes = res;
        this.loading = false;
        console.log('✅ Reportes cargados:', res);
        if (event) event.target.complete();
      },
      error: async (err) => {
        console.error('❌ Error al cargar reportes:', err);
        this.loading = false;
        this.error = true;
        if (event) event.target.complete();
        
        if (err.status === 404) {
          console.warn('⚠️ Endpoint /reportes-globales no encontrado');
          await this.presentToast('Endpoint de reportes no implementado', 'warning');
          // Datos de ejemplo para desarrollo
          this.reportes = {
            totalTurnos: 0,
            turnosHoy: 0,
            usuariosActivos: 0,
            turnosPendientes: 0,
            turnosAtendidos: 0,
            negociosActivos: 0
          };
        } else if (err.status === 401) {
          await this.presentToast('Sesión expirada', 'danger');
        } else if (err.status === 403) {
          await this.presentToast('No tienes permisos para ver reportes', 'danger');
        } else {
          await this.presentToast('Error al cargar reportes', 'danger');
        }
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
