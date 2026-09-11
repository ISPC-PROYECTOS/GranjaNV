import { Component, EventEmitter,Input, Output, inject, signal } from '@angular/core';
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

  @Input() set nombreInicial(valor: string) {
    if (valor) {
      this.formularioCliente.patchValue({ nombre: valor });
    }
  }

  @Output() clienteCreado = new EventEmitter<Cliente>();
  @Output() cerrar = new EventEmitter<void>();

  errorBackend = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  mostrarConfirmacion = signal<boolean>(false);

  formularioCliente: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: [''],
    telefono: ['', [Validators.required]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.email]],
    tipo: ['MINORISTA', [Validators.required]]
  });

  solicitarConfirmacion(): void {
  if (this.formularioCliente.invalid) {
    this.formularioCliente.markAllAsTouched();
    return;
  }
  this.errorBackend.set(null);
  this.mostrarConfirmacion.set(true);
}

cancelarConfirmacion(): void {
  this.mostrarConfirmacion.set(false);
}

confirmarYGuardar(): void {
  this.isLoading.set(true);
  this.errorBackend.set(null);
  this.mensajeExito.set(null);

  const nuevoCliente: Partial<Cliente> = this.formularioCliente.value;

  this.clientesService.crearCliente(nuevoCliente).subscribe({
    next: (clienteGuardado) => {
      this.isLoading.set(false);
      this.mostrarConfirmacion.set(false);
      this.mensajeExito.set('¡Cliente guardado exitosamente!');

      this.clienteCreado.emit(clienteGuardado);

      setTimeout(() => {
        this.cerrar.emit();
      }, 2000);
    },
    error: (err) => {
      this.isLoading.set(false);
      this.mostrarConfirmacion.set(false);
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
      tipo: 'MINORISTA'
    });
    this.errorBackend.set(null);
    this.mensajeExito.set(null);
    this.mostrarConfirmacion.set(false);
  }

  cerrarFormulario(): void {
    this.cerrar.emit();
  }
}