import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.page.html',
  styleUrls: ['./turnos.page.scss'],
})
export class TurnosPage implements OnInit {
  turnos: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.loading = true;
    
    const usuario = this.auth.user;
    const sucursalId = usuario?.sucursal_id || usuario?.sucursal?.id;
    
    console.log('👤 Agente - Usuario ID:', usuario?.id);
    console.log('🏢 Agente - Sucursal ID:', sucursalId);
    
    this.http.get(`${environment.apiUrl}/turnos`, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        const todosTurnos = Array.isArray(res) ? res : (res.data || []);
        console.log('📋 Total de turnos:', todosTurnos.length);
        
        // Filtrar solo turnos de MI sucursal
        if (sucursalId) {
          this.turnos = todosTurnos.filter(t => 
            t.sucursal_id === sucursalId || t.negocio_id === sucursalId
          );
          console.log('📋 Turnos de mi sucursal:', this.turnos.length);
        } else {
          // Si es admin, mostrar todos
          this.turnos = todosTurnos;
          console.log('⚠️ Sin sucursal asignada - mostrando todos los turnos');
        }
        
        this.loading = false;
        console.log('✅ Turnos cargados:', this.turnos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar turnos:', err);
        this.turnos = [];
        this.loading = false;
      }
    });
  }

  llamarSiguiente() {
    this.http.post(`${environment.apiUrl}/turnos/llamar-siguiente`, {}, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Siguiente turno llamado:', res);
        this.cargarTurnos();
      },
      error: (err) => {
        console.error('❌ Error al llamar siguiente turno:', err);
      }
    });
  }

  confirmarTurno(id: number) {
    this.http.put(`${environment.apiUrl}/turnos/${id}/confirmar`, {}, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Turno confirmado:', res);
        this.cargarTurnos();
      },
      error: (err) => {
        console.error('❌ Error al confirmar turno:', err);
      }
    });
  }

  cancelarTurno(id: number) {
    this.http.put(`${environment.apiUrl}/turnos/${id}/cancelar`, {}, { headers: this.auth.headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Turno cancelado:', res);
        this.cargarTurnos();
      },
      error: (err) => {
        console.error('❌ Error al cancelar turno:', err);
      }
    });
  }
}
