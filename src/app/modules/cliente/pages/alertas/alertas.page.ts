import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
})
export class AlertasPage implements OnInit {
  alertas: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarAlertas();
  }

  cargarAlertas(event?: any) {
    this.loading = true;
    
    const usuarioId = this.auth.user?.id;
    console.log('👤 Cargando alertas para usuario ID:', usuarioId);
    console.log('URL:', `${environment.apiUrl}/alertas`);
    
    if (!usuarioId) {
      console.error('❌ No se encontró el ID del usuario autenticado');
      this.loading = false;
      if (event) event.target.complete();
      return;
    }
    
    this.http.get(`${environment.apiUrl}/alertas`, {
      headers: this.auth.headers
    }).subscribe({
      next: (res: any) => {
        const todasLasAlertas = Array.isArray(res) ? res : (res.data || []);
        console.log('📋 Total de alertas:', todasLasAlertas.length);
        
        // FILTRAR solo alertas del usuario autenticado
        this.alertas = todasLasAlertas.filter(a => a.usuario_id === usuarioId);
        console.log('📋 Mis alertas:', this.alertas.length, this.alertas);
        
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('❌ Error al cargar alertas:', err);
        this.alertas = [];
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  marcarComoLeida(alerta: any) {
    if (!alerta.id) return;
    
    this.http.put(`${environment.apiUrl}/alertas/${alerta.id}/leida`, {}, {
      headers: this.auth.headers
    }).subscribe({
      next: () => {
        alerta.leida = true;
        console.log('Alerta marcada como leída');
      },
      error: (err) => console.error('Error al marcar alerta:', err)
    });
  }

  getColor(tipo: string) {
    switch (tipo) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'primary';
    }
  }
}
