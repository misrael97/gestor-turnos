import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private apiUrl = 'http://localhost:8000/api/turnos';

  constructor(private http: HttpClient) {}

  getTurnos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTurno(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTurno(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateTurno(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteTurno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  llamarSiguiente(colaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/llamar-siguiente`, { cola_id: colaId });
  }

  reasignarTurno(turnoId: number, nuevaColaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reasignar`, { turno_id: turnoId, nueva_cola_id: nuevaColaId });
  }

  cancelarTurno(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancelar`, { id });
  }
}
