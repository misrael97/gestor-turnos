import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ColasService {
  private apiUrl = 'http://localhost:8000/api/colas';

  constructor(private http: HttpClient) {}

  getColas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getCola(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCola(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCola(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCola(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
