import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable,} from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';

  // --- Reactividad (del Servicio #1) ---
  // Gestionamos el estado del token y del usuario con BehaviorSubject
  // Intentamos leer el valor inicial desde localStorage
  private token$ = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenKey));
  private user$ = new BehaviorSubject<any | null>(JSON.parse(localStorage.getItem(this.userKey) || 'null'));

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    // AuthService iniciado
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
  // public get headers(): HttpHeaders {
  //   return new HttpHeaders({
  //     'Authorization': `Bearer ${this.token}`
  //   });
  // }

  // ---------------------------
  // Métodos de Autenticación
  // ---------------------------

  /**
   * Realiza el login inicial - NO guarda la sesión todavía (se espera 2FA)
   */
  login(data: any): Observable<any> {
    const url = `${this.api}/login`;
    return this.http.post<any>(url, data);
  }

  /**
   * Verifica el código 2FA y completa el login
   */
  verify2FA(email: string, code: string): Observable<any> {
    const payload = { email, code };
    return this.http.post<any>(`${this.api}/login/verify-2fa`, payload);
  }

  /**
   * Reenvía el código 2FA
   */
  resend2FA(email: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login/resend-2fa`, { email });
  }

  me(): Observable<any> {
    const headers = this.headers;
    return this.http.get(`${this.api}/me`, { headers });
  }
  get headers(): HttpHeaders {
    const currentToken = this.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${currentToken}`,
      'Accept': 'application/json'
    });
  }


  

  /**
   * Realiza el registro y, si tiene éxito, guarda la sesión.
   * (Del Servicio #2, pero con el 'tap' del Servicio #1)
   */
  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/register`, data).pipe(
      tap((res) => {
        // Asumimos que la respuesta tiene 'token' y 'user'
        this.saveSession(res.token, res.user);
      })
    );
  }

  // ---------------------------
  // Gestión de Sesión (del Servicio #2, pero mejorado)
  // ---------------------------

  /**
   * Guarda el token y el usuario en localStorage Y actualiza los BehaviorSubjects.
   */
  saveSession(token: string, user: any) {
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
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Notifica a todos los "oyentes" que la sesión se cerró
    this.token$.next(null);
    this.user$.next(null);
    
    this.router.navigate(['/auth/login']);
  }

  // ---------------------------
  // Utilidades (del Servicio #2)
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