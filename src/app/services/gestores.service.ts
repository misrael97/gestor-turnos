import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GestoresService {
  private apiUrl = 'http://localhost:8000/api/gestores';

  constructor(private http: HttpClient) {}

  getGestores(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getGestor(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createGestor(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateGestor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteGestor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}






