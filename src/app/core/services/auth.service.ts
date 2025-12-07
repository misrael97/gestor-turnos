import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, timeout, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';
  private readonly REQUEST_TIMEOUT = 15000; // 15 segundos

  // --- Reactividad (del Servicio #1) ---
  // Gestionamos el estado del token y del usuario con BehaviorSubject
  // Intentamos leer el valor inicial desde localStorage
  private token$ = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenKey));
  private user$ = new BehaviorSubject<any | null>(JSON.parse(localStorage.getItem(this.userKey) || 'null'));

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔐 AuthService iniciado - API URL:', this.api);
  }

  // ---------------------------
  // Observables Públicos (para que los componentes escuchen)
  // ---------------------------

  /** Devuelve un Observable que emite el token cada vez que cambia. */
  public get tokenChanges(): Observable<string | null> {
    return this.token$.asObservable();
  }

  /** Devuelve un Observable que emite el usuario cada vez que cambia. */
  public get userChanges(): Observable<any | null> {
    return this.user$.asObservable();
  }

  // ---------------------------
  // Getters (del Servicio #2)
  // ---------------------------

  /** Devuelve el valor actual del token. */
  public get token(): string | null {
    return this.token$.value;
  }

  /** Devuelve el valor actual del usuario. */
  public get user(): any | null {
    return this.user$.value;
  }

  /** Devuelve true si el usuario está autenticado (hay un token). */
  public get isAuthenticated(): boolean {
    return !!this.token$.value;
  }

  /** Devuelve los headers de autorización listos para una petición HTTP. */
  get headers(): HttpHeaders {
    const currentToken = this.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${currentToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // ---------------------------
  // Métodos de Autenticación con Timeout y Error Handling
  // ---------------------------

  /**
   * Realiza el login inicial - NO guarda la sesión todavía (se espera 2FA)
   */
  login(data: any): Observable<any> {
    const url = `${this.api}/login`;
    console.log('🔑 Intentando login en:', url);

    return this.http.post<any>(url, data).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(err => {
        console.error('❌ Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Verifica el código 2FA y completa el login
   */
  verify2FA(email: string, code: string): Observable<any> {
    const payload = { email, code };
    console.log('🔐 Verificando 2FA para:', email);

    return this.http.post<any>(`${this.api}/login/verify-2fa`, payload).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(err => {
        console.error('❌ Error en verify2FA:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Reenvía el código 2FA
   */
  resend2FA(email: string): Observable<any> {
    console.log('📧 Reenviando código 2FA a:', email);

    return this.http.post<any>(`${this.api}/login/resend-2fa`, { email }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(err => {
        console.error('❌ Error en resend2FA:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene la información del usuario autenticado
   */
  me(): Observable<any> {
    const headers = this.headers;
    return this.http.get(`${this.api}/me`, { headers }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(err => {
        console.error('❌ Error en me():', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Realiza el registro y, si tiene éxito, guarda la sesión.
   */
  register(data: any): Observable<any> {
    console.log('📝 Registrando nuevo usuario');

    return this.http.post<any>(`${this.api}/register`, data).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap((res) => {
        // Asumimos que la respuesta tiene 'token' y 'user'
        this.saveSession(res.token, res.user);
      }),
      catchError(err => {
        console.error('❌ Error en register:', err);
        return throwError(() => err);
      })
    );
  }

  // ---------------------------
  // Gestión de Sesión
  // ---------------------------

  /**
   * Guarda el token y el usuario en localStorage Y actualiza los BehaviorSubjects.
   */
  saveSession(token: string, user: any) {
    console.log('💾 Guardando sesión para:', user?.name || user?.email);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));

    // Esto notificará a todos los "oyentes" que la sesión cambió
    this.token$.next(token);
    this.user$.next(user);
  }

  /**
   * Cierra la sesión: limpia localStorage, actualiza BehaviorSubjects y redirige.
   */
  logout() {
    console.log('👋 Cerrando sesión');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Notifica a todos los "oyentes" que la sesión se cerró
    this.token$.next(null);
    this.user$.next(null);

    this.router.navigate(['/auth/login']);
  }

  // ---------------------------
  // Utilidades
  // ---------------------------

  /**
   * Redirige al usuario a la ruta principal según su rol.
   */
  redirectByRole(role: string) {
    switch (role) {
      case 'SuperAdmin':
        this.router.navigate(['/super/negocios']);
        break;
      case 'AdminSucursal':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Cliente':
      default:
        this.router.navigate(['/cliente/home']);
        break;
    }
  }

  /**
   * Obtiene el nombre del rol del usuario.
   */
  getRoleName(): string | null {
    return this.user?.role?.nombre || this.user?.role?.name || null;
  }
}