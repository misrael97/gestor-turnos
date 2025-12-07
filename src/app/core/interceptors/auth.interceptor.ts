// src/app/core/interceptors/auth.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token'); // 1. Lee el token

    // 2. Si es una petición de login o registro, no le pongas el token
    if (req.url.endsWith('/login') || req.url.endsWith('/register')) {
      return next.handle(req);
    }

    // 3. Para todas las demás peticiones, clona la petición y añade el header
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }

    // 4. Si no hay token, deja pasar la petición original
    return next.handle(req);
  }
}