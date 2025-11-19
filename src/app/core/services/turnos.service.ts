import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private api = `${environment.apiUrl}/turnos`;
  private apiSucursales = `${environment.apiUrl}/sucursales`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  obtenerTurnos() {
    return this.http.get(this.api, { headers: this.auth.headers });
  }

  obtenerTurnoPorId(id: number) {
    return this.http.get(`${this.api}/${id}`, { headers: this.auth.headers });
  }

  crearTurno(data: any) {
    return this.http.post(this.api, data, { headers: this.auth.headers });
  }

  getSucursales() {
    return this.http.get(this.apiSucursales, { headers: this.auth.headers });
  }

  verificarDisponibilidad(sucursal_id: number, fecha: string, hora: string) {
    return this.http.get(`${this.api}/disponibilidad`, {
      params: { sucursal_id: sucursal_id.toString(), fecha, hora },
      headers: this.auth.headers
    });
  }

  llamarSiguiente() {
    return this.http.put(`${this.api}/llamar`, {}, { headers: this.auth.headers });
  }

  cancelarTurno(id: number) {
    return this.http.delete(`${this.api}/${id}`, { headers: this.auth.headers });
  }

  historial() {
    return this.http.get(`${this.api}/historial`, { headers: this.auth.headers });
  }

  reportes() {
    return this.http.get(`${this.api}/reportes`, { headers: this.auth.headers });
  }
}
