import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario, LoginResponse, RegistroRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8000/api/auth';

  currentUser = signal<Usuario | null>(this.getUserFromStorage());
  accessToken = signal<string | null>(localStorage.getItem('access_token'));

  isAuthenticated = computed(() => !!this.accessToken());
  isAdmin = computed(() => this.currentUser()?.rol === 'Administrador');

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));

        this.accessToken.set(res.access);
        this.currentUser.set(res.user);

        if (res.user.rol === 'Administrador') {
          this.router.navigate(['/dashboard/admin']);
        } else {
          this.router.navigate(['/dashboard/produccion']);
        }
      })
    );
  }

  registrarUsuario(userData: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro/`, userData);
  }

  logout(): void {
    localStorage.clear();
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  requestOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-otp/`, { email });
  }

  resetPasswordWithOtp(payload: { email: string; otp: string; new_password: string }): Observable<any> {
   return this.http.post(`${this.apiUrl}/reset-password-otp/`, payload);
  }

  private getUserFromStorage(): Usuario | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}