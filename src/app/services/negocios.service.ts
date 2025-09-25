import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NegociosService {
  private apiUrl = 'http://localhost:8000/api/negocios';

  constructor(private http: HttpClient) {}

  getNegocios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getNegocio(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createNegocio(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateNegocio(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteNegocio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}




