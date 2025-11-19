import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  turnos: any[] = [];
  turnoActual: any = null;
  totalTurnos = 0;
  turnosPendientes = 0;
  turnosAtendidos = 0;
  loading = false;
  miSucursal: any = null;
  private refreshSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cargarDatosSucursal();
    this.cargarTurnos();
    
    // Actualizar cada 10 segundos
    const usuario = this.auth.user;
    const sucursalId = usuario?.sucursal_id || usuario?.sucursal?.id;
    
    this.refreshSubscription = interval(10000)
      .pipe(switchMap(() => this.http.get(`${environment.apiUrl}/turnos`, { headers: this.auth.headers })))
      .subscribe({
        next: (res: any) => {
          const todosTurnos = Array.isArray(res) ? res : (res.data || []);
          
          // Filtrar turnos de MI sucursal y en espera
          this.turnos = todosTurnos.filter(t => {
            const esDeMiSucursal = sucursalId ? (t.sucursal_id === sucursalId || t.negocio_id === sucursalId) : true;
            const enEspera = t.estado === 'espera' || t.estado === 'en espera' || t.estado === 'pendiente';
            return esDeMiSucursal && enEspera;
          });
          
          this.actualizarEstadisticas();
        },
        error: (err) => console.error('Error en auto-refresh:', err)
      });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  cargarDatosSucursal() {
    // Obtener información de la sucursal del agente
    const usuario = this.auth.user;
    if (usuario?.sucursal) {
      this.miSucursal = usuario.sucursal;
    }
  }

  async cargarTurnos(event?: any) {
    this.loading = true;
    
    const usuario = this.auth.user;
    const sucursalId = usuario?.sucursal_id || usuario?.sucursal?.id;
    
    console.log('👤 Agente - Usuario ID:', usuario?.id);
    console.log('🏢 Agente - Sucursal ID:', sucursalId);
    
    this.http.get(`${environment.apiUrl}/turnos`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        const todosTurnos = Array.isArray(res) ? res : (res.data || []);
        console.log('📋 Total de turnos:', todosTurnos.length);
        
        // Filtrar turnos de MI sucursal y en espera
        this.turnos = todosTurnos.filter(t => {
          const esDeMiSucursal = sucursalId ? (t.sucursal_id === sucursalId || t.negocio_id === sucursalId) : true;
          const enEspera = t.estado === 'espera' || t.estado === 'en espera' || t.estado === 'pendiente';
          return esDeMiSucursal && enEspera;
        });
        
        console.log('📋 Turnos de mi sucursal en espera:', this.turnos.length);
        
        this.actualizarEstadisticas();
        this.loading = false;
        if (event) event.target.complete();
      },
      error: async (err) => {
        console.error('❌ Error al cargar turnos:', err);
        this.turnos = [];
        this.loading = false;
        if (event) event.target.complete();
        await this.presentToast('Error al cargar turnos', 'danger');
      }
    });
  }

  actualizarEstadisticas() {
    this.totalTurnos = this.turnos.length;
    this.turnosPendientes = this.turnos.filter(t => t.estado === 'en espera').length;
  }

  async llamarSiguiente() {
    if (this.turnos.length === 0) {
      await this.presentToast('No hay turnos en espera', 'warning');
      return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Llamando turno...' });
    await loader.present();

    this.http.post(`${environment.apiUrl}/turnos/llamar-siguiente`, {}, { headers: this.auth.headers }).subscribe({
      next: async (res: any) => {
        await loader.dismiss();
        this.turnoActual = res.turno;
        await this.presentToast(`¡Turno #${res.turno.numero || res.turno.id} llamado!`, 'success');
        this.cargarTurnos();
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al llamar turno:', err);
        await this.presentToast('Error al llamar siguiente turno', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await toast.present();
  }
}
