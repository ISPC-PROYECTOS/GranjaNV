import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { RegistroRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-usuario.html',
  styleUrl: './registro-usuario.css'
})
export class RegistroUsuarioComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  registroForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    rol: ['Empleado' as 'Administrador' | 'Empleado', [Validators.required]]
  });

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formData = this.registroForm.value as RegistroRequest;

    this.authService.registrarUsuario(formData).subscribe({
      next: () => {
        this.successMessage.set('Usuario registrado exitosamente.');
        this.registroForm.reset({ rol: 'Empleado' });
      },
      error: (err) => {
        this.errorMessage.set(err.error?.email?.[0] || 'Error al intentar registrar el usuario.');
      }
    });
  }
}