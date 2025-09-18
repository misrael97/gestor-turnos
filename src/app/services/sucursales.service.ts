import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private apiUrl = 'http://localhost:8000/api/sucursales';

  constructor(private http: HttpClient) {}

  getSucursales(negocioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${negocioId}`);
  }

  getSucursal(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/show/${id}`);
  }

  createSucursal(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateSucursal(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteSucursal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

