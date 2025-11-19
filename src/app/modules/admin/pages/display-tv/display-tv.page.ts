import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { TurnosService } from 'src/app/core/services/turnos.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-display-tv',
  templateUrl: './display-tv.page.html',
  styleUrls: ['./display-tv.page.scss'],
})
export class DisplayTvPage implements OnInit, OnDestroy {
  turnoActual: string = '---';
  siguienteTurno: string = '---';
  turnosEnEspera: number = 0;
  videoUrl: string = '';
  sucursalNombre: string = '';
  puestoNumero: string = '';
  
  puestoId: number | null = null;
  sucursalId: number | null = null;

  private refreshSubscription?: Subscription;

  constructor(
    private turnosService: TurnosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('📺 Display TV iniciado');
    
    // Obtener parámetros de URL (opcional): /admin/display-tv?puesto=1&sucursal=2
    this.route.queryParams.subscribe(params => {
      this.puestoId = params['puesto'] ? +params['puesto'] : null;
      this.sucursalId = params['sucursal'] ? +params['sucursal'] : null;
      console.log('📍 Parámetros recibidos - Puesto:', this.puestoId, 'Sucursal:', this.sucursalId);
    });
    
    // Actualizar cada 3 segundos
    this.refreshSubscription = interval(3000).subscribe(() => {
      this.obtenerTurnosActuales();
    });

    // Cargar datos iniciales
    this.obtenerTurnosActuales();
    
    // Modo pantalla completa automático (opcional - comentado)
    // this.activarPantallaCompleta();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  obtenerTurnosActuales() {
    this.turnosService.obtenerTurnos().subscribe({
      next: (response: any) => {
        console.log('📊 Datos de turnos recibidos:', response);
        
        let turnosFiltrados = [];
        
        // Adaptar según la estructura de tu API
        if (response && Array.isArray(response)) {
          turnosFiltrados = response;
        } else if (response && response.data) {
          turnosFiltrados = response.data;
        }
        
        // Filtrar por sucursal si está especificada
        if (this.sucursalId) {
          turnosFiltrados = turnosFiltrados.filter((t: any) => 
            t.sucursal_id === this.sucursalId
          );
          console.log(`🏢 Filtrando por sucursal ${this.sucursalId}:`, turnosFiltrados.length, 'turnos');
        }
        
        // Buscar turno en atención (estado = 'atendiendo' o 'llamado')
        let enAtencion = turnosFiltrados.find((t: any) => 
          t.estado === 'atendiendo' || t.estado === 'llamado'
        );
        
        // Si hay filtro de puesto, buscar específicamente ese puesto
        if (this.puestoId) {
          enAtencion = turnosFiltrados.find((t: any) => 
            (t.estado === 'atendiendo' || t.estado === 'llamado') && 
            t.puesto_id === this.puestoId
          );
        }
        
        // Buscar siguiente turno (estado = 'espera')
        const enEspera = turnosFiltrados.filter((t: any) => t.estado === 'espera');
        
        this.turnoActual = enAtencion ? 
          `${enAtencion.prefijo || ''}${enAtencion.numero}` : '---';
        
        this.siguienteTurno = enEspera.length > 0 ? 
          `${enEspera[0].prefijo || ''}${enEspera[0].numero}` : '---';
        
        this.turnosEnEspera = enEspera.length;
        
        // Obtener nombre de sucursal y puesto del turno en atención
        if (enAtencion) {
          this.sucursalNombre = enAtencion.sucursal?.nombre || '';
          this.puestoNumero = enAtencion.puesto?.numero || enAtencion.puesto_id || '';
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo turnos:', error);
        // Mantener valores actuales en caso de error
      }
    });
  }

  activarPantallaCompleta() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.log('No se pudo activar pantalla completa:', err);
      });
    }
  }
}
