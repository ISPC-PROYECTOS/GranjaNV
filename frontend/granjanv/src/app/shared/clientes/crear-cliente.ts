import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-cliente.html',
  styleUrl: './crear-cliente.css'
})
export class CrearClienteComponent {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);

  // Emite los datos esenciales al componente padre (pedido en curso)
  @Output() clienteCreado = new EventEmitter<{ nombre: string, telefono: string, direccion: string, id?: number }>();
  // Emite el evento para que el padre desmonte/oculte este componente
  @Output() cerrar = new EventEmitter<void>();

  errorBackend = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  formularioCliente: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: [''],
    telefono: ['', [Validators.required]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.email]],
    tipo: ['MINORISTA', [Validators.required]]
  });

  guardar(): void {
    if (this.formularioCliente.invalid) {
      this.formularioCliente.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorBackend.set(null);

    const nuevoCliente: Partial<Cliente> = this.formularioCliente.value;

    this.clientesService.crearCliente(nuevoCliente).subscribe({
      next: (clienteGuardado) => {
        this.isLoading.set(false);
        this.clienteCreado.emit({
          id: clienteGuardado.id,
          nombre: clienteGuardado.nombre,
          telefono: clienteGuardado.telefono,
          direccion: clienteGuardado.direccion
        });
        this.cerrar.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        // Captura el error de validación única de DRF (o cualquier otro)
        if (err.error && err.error.nombre) {
          this.errorBackend.set(err.error.nombre[0]);
        } else {
          this.errorBackend.set('Ocurrió un error al intentar guardar el cliente.');
        }
      }
    });
  }

  limpiar(): void {
    this.formularioCliente.reset({
      tipo: 'MINORISTA' // Mantiene el valor por defecto
    });
    this.errorBackend.set(null);
  }

  cerrarFormulario(): void {
    this.cerrar.emit();
  }
}