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
  successMessage = signal<string | null>(null);

  // Estado del flujo: 'login' | 'otp_reset'
  step = signal<'login' | 'otp_reset'>('login');

  // Formulario de login
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Formulario para ingreso de OTP y nueva contraseña
  resetOtpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const userRole = res.user?.rol?.toLowerCase();

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
    const emailControl = this.loginForm.get('email');
    if (!emailControl || emailControl.invalid || !emailControl.value) {
      this.errorMessage.set('Ingresá un correo electrónico válido para solicitar el código OTP.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.requestOtp(emailControl.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Se ha enviado un código OTP a tu correo.');
        this.step.set('otp_reset');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || 'No se pudo procesar la solicitud de recuperación.');
      }
    });
  }

  onConfirmResetPassword(): void {
    if (this.resetOtpForm.invalid) {
      this.resetOtpForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')?.value;
    const { otp, newPassword } = this.resetOtpForm.value;

    if (!email) {
      this.errorMessage.set('Debes ingresar un correo electrónico.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      email: email,
      otp: otp!,
      new_password: newPassword!
    };

    this.authService.resetPasswordWithOtp(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Contraseña restablecida con éxito.');
        this.step.set('login');
        this.resetOtpForm.reset();
        this.loginForm.patchValue({ password: '' });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'El código OTP es inválido o expiró.');
      }
    });
  }

  cancelReset(): void {
    this.step.set('login');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}