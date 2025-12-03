import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface TurnoDisplay {
  numero: string;
  puesto: number | string;
}

@Component({
  selector: 'app-display-publico',
  templateUrl: './display-publico.component.html',
  styleUrls: ['./display-publico.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DisplayPublicoComponent implements OnInit, OnDestroy {
  sucursalId: string = '';
  sucursalNombre: string = 'Pantalla de Turnos';
  currentTime: Date = new Date();
  
  currentTurn: TurnoDisplay = {
    numero: '--',
    puesto: '--',
  };

  calledNumbers: TurnoDisplay[] = [];
  private refreshSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.sucursalId = this.route.snapshot.paramMap.get('id') || '';
    
    // Actualizar reloj cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Actualizar cada 3 segundos
    this.refreshSubscription = interval(3000)
      .pipe(
        startWith(0), // Ejecutar inmediatamente
        switchMap(() => this.http.get(`${environment.apiUrl}/display/${this.sucursalId}`))
      )
      .subscribe({
        next: (response: any) => {
          console.log('📺 Display Público - Turnos recibidos:', response);
          this.updateDisplay(response);
        },
        error: (err) => {
          console.error('❌ Error al cargar turnos para display:', err);
          this.clearDisplay();
        },
      });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  updateDisplay(turnos: any[]) {
    if (!Array.isArray(turnos) || turnos.length === 0) {
      this.clearDisplay();
      return;
    }

    // Obtener nombre de la sucursal del primer turno
    if (turnos[0]?.negocio?.nombre) {
      this.sucursalNombre = turnos[0].negocio.nombre;
    }

    // Filtrar solo turnos activos
    const turnosActivos = turnos.filter(
      (t) => t.estado === 'llamado' || t.estado === 'espera'
    );

    if (turnosActivos.length === 0) {
      this.clearDisplay();
      return;
    }

    // Mapear a la estructura que espera la vista
    const turnosMapeados = turnosActivos.map((turno) => ({
      id: turno.id,
      numero: this.generarCodigo(turno.id),
      puesto: this.obtenerPuesto(turno),
      updated_at: turno.updated_at || turno.created_at,
      estado: turno.estado,
    }));

    // Ordenar por fecha de actualización (más reciente primero)
    const sortedTurnos = turnosMapeados.sort((a, b) => {
      const dateA = new Date(a.updated_at || 0).getTime();
      const dateB = new Date(b.updated_at || 0).getTime();
      return dateB - dateA;
    });

    // El turno más reciente es el actual (SU TURNO)
    const latest = sortedTurnos[0];
    this.currentTurn = {
      numero: latest.numero,
      puesto: latest.puesto,
    };

    // Los siguientes 4 son los números llamados
    this.calledNumbers = sortedTurnos.slice(1, 5).map((t) => ({
      numero: t.numero,
      puesto: t.puesto,
    }));

    console.log('📺 Turno actual:', this.currentTurn);
    console.log('📺 Números llamados:', this.calledNumbers);
  }

  generarCodigo(id: number): string {
    return `T${String(id).padStart(3, '0')}`;
  }

  obtenerPuesto(turno: any): number | string {
    if (turno.cola) return turno.cola;
    if (turno.negocio_id) return turno.negocio_id;
    if (turno.negocio?.nombre) return turno.negocio.nombre;
    return 'N/A';
  }

  clearDisplay() {
    this.currentTurn = {
      numero: '--',
      puesto: '--',
    };
    this.calledNumbers = [];
    console.log('📺 Display limpio - No hay turnos activos');
  }
}
