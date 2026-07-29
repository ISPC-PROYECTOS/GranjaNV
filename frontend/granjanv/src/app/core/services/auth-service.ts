import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface Usuario {
  id_usuario?: number;
  apellido: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
  user: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/auth/';

  private currentUserSignal = signal<Usuario | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(storedUser));
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res) => {
        if (res.access) {
          localStorage.setItem('access_token', res.access);
          if (res.refresh) {
            localStorage.setItem('refresh_token', res.refresh);
          }
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSignal.set(res.user);
        }
      })
    );
  }

  register(userData: Partial<Usuario> & { password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset-request/`, { email });
  }

  verifyPasswordReset(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset-verify/`, data);
  }

  refreshToken(): Observable<{ access: string; refresh?: string }> {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      this.logout();
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    return this.http.post<{ access: string; refresh?: string }>(
      `${this.apiUrl}/token/refresh/`, 
      { refresh }
    ).pipe(
      tap((res) => {
        if (res.access) {
          localStorage.setItem('access_token', res.access);
          if (res.refresh) {
            localStorage.setItem('refresh_token', res.refresh);
          }
        }
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me');
    localStorage.removeItem('refresh_token');
    this.currentUserSignal.set(null);
  }

  getUserData(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/profile/`);
  }

  changePassword(data: { old_password?: string; new_password: string; token?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password/`, data);
  }
}