import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Formulario de login
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const userRole = res.user?.rol?.toLowerCase();

        // Redirección según rol
        if (userRole === 'admin' || userRole === 'administrador' || userRole === 'nahuel') {
          this.router.navigate(['/dashboard/admin/panel-de-control']);
        } else {
          this.router.navigate(['/dashboard/produccion/gestion-huevos']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401 || err.status === 400) {
          this.errorMessage.set('Usuario o contraseña incorrectos.');
        } else {
          this.errorMessage.set('Error al conectar con el servidor.');
        }
      }
    });
  }

  onForgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    
    if (!email) {
      this.errorMessage.set('Ingresá tu correo electrónico para solicitar la recuperación.');
      return;
    }

    this.isLoading.set(true);
    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('Se ha enviado un correo para recuperar tu contraseña.');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo procesar la solicitud de recuperación.');
      }
    });
  }
}