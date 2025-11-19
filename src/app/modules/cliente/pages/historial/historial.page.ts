import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  historial: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial(event?: any) {
    this.loading = true;
    
    const usuarioId = this.auth.user?.id;
    console.log('👤 Cargando historial para usuario ID:', usuarioId);
    
    if (!usuarioId) {
      console.error('❌ No se encontró el ID del usuario autenticado');
      this.loading = false;
      if (event) event.target.complete();
      return;
    }
    
    this.http.get(`${environment.apiUrl}/turnos/historial`, {
      headers: this.auth.headers
    }).subscribe({
      next: (res: any) => {
        const todosLosTurnos = Array.isArray(res) ? res : (res.data || []);
        console.log('📋 Total de turnos en historial:', todosLosTurnos.length);
        
        // FILTRAR solo turnos del usuario autenticado
        this.historial = todosLosTurnos.filter(t => t.usuario_id === usuarioId);
        console.log('📋 Mis turnos en historial:', this.historial.length);
        
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('❌ Error al cargar historial:', err);
        this.historial = [];
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  getColor(estado: string) {
    switch (estado) {
      case 'Atendido': return 'success';
      case 'Cancelado': return 'danger';
      case 'No Confirmado': return 'warning';
      default: return 'medium';
    }
  }
}
