// src/app/core/services/api.service.ts
// (Ya no se importa 'axios')

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 1. Importa HttpClient
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // 2. Importa 'tap' para efectos secundarios

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseURL = 'http://127.0.0.1:8000/api'; // 🔗 tu Laravel API

  // 3. Inyecta HttpClient
  constructor(private http: HttpClient) {}

  //  LOGIN
  // (Devuelve un Observable, que es lo estándar en Angular)
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/login`, { email, password }).pipe(
      // 4. Usa 'tap' para el efecto secundario de guardar el token
      tap(res => {
        localStorage.setItem('token', res.token);
        // NO necesitas poner el header, el interceptor lo hará en la prox. petición
      })
    );
  }

  //  REGISTRO
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/register`, data);
  }

  //    LOGOUT
  logout(): Observable<any> {
    // El Interceptor se encarga de añadir el token a esta petición
    return this.http.post(`${this.baseURL}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token'); // Quita el token DESPUÉS de hacer logout
      })
    );
  }

  // PERFIL
  me(): Observable<any> {
    // El Interceptor se encarga de añadir el token
    return this.http.get(`${this.baseURL}/me`);
  }

  // OBTENER TURNOS
  obtenerTurnos(): Observable<any> {
    // El Interceptor se encarga de añadir el token
    return this.http.get(`${this.baseURL}/turnos`);
  }

  // CREAR TURNO
  crearTurno(negocio_id: number): Observable<any> {
    // El Interceptor se encarga de añadir el token
    return this.http.post(`${this.baseURL}/turnos`, { negocio_id });
  }

  // CANCELAR TURNO
  cancelarTurno(turno_id: number): Observable<any> {
    // El Interceptor se encarga de añadir el token
    return this.http.post(`${this.baseURL}/turnos/${turno_id}/cancelar`, {});
  }
}