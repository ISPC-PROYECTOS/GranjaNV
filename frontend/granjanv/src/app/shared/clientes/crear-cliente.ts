import { Component, EventEmitter,Input, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../core/models/cliente.model';
import { ClienteSugerenciasComponent } from '../clientes-sugerencias/clientes-sugerencias';

const PATRON_TEXTO = '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]{3,}$';
const PATRON_TELEFONO = '^[0-9]{10,}$';
@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClienteSugerenciasComponent, ClienteSugerenciasComponent],
  templateUrl: './crear-cliente.html',
  styleUrl: './crear-cliente.css'
})
export class CrearClienteComponent {
  private fb = inject(FormBuilder); 
  private clientesService = inject(ClientesService);

  
  @Input() set nombreInicial(valor: string) {
    if (valor && !this.clienteId()) {
      this.formularioCliente.patchValue({ nombre: valor });
    }
  }

  @Input() set clienteEdicion(cliente: Cliente | null) {
    if (cliente) {
      this.clienteId.set(cliente.id ?? null);
      this.formularioCliente.patchValue({
        nombre: cliente.nombre,
        apellido: cliente.apellido || '',
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        email: cliente.email || '',
        tipo: cliente.tipo
      });
    } else {
      this.clienteId.set(null);
    }
  }

  @Output() clienteGuardado = new EventEmitter<Cliente>();
  @Output() cerrar = new EventEmitter<void>();

  clienteId = signal<number | null>(null);
  errorBackend = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  mostrarConfirmacion = signal<boolean>(false);

  // Signal para guardar la lista de clientes registrados
  clientesExistentes = signal<Cliente[]>([]);

  constructor() {
    this.clientesService.obtenerClientes().subscribe({
      next: (data) => this.clientesExistentes.set(data),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  formularioCliente: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(PATRON_TEXTO)]],
    apellido: ['', [Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]{3,}$')]],
    telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO), Validators.minLength(10)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.email]],
    tipo: ['MINORISTA', [Validators.required]]
  });

  // Escuchamos en tiempo real los cambios de nombre y apellido
  private nombreValue = toSignal(this.formularioCliente.get('nombre')!.valueChanges, {
    initialValue: this.formularioCliente.get('nombre')?.value || ''
  });

  private apellidoValue = toSignal(this.formularioCliente.get('apellido')!.valueChanges, {
    initialValue: this.formularioCliente.get('apellido')?.value || ''
  });

  // Lista de coincidencia en tiempo real mientras escribe el nombre
  coincidenciasNombre = computed(() => {
    const nomOriginal = this.nombreValue() || '';
    const nom = (this.nombreValue() || '').trim().toLowerCase();
    if (!nom || nom.length < 2) return [];

    if (nomOriginal.includes(' ')) return [];

    const existeExacto = this.clientesExistentes().some(c => c.nombre.trim().toLowerCase() === nom);
    if (existeExacto) return [];

    return this.clientesExistentes().filter(c => 
      c.nombre.toLowerCase().includes(nom)
    );
  });

  // Detección inmediata si el NOMBRE ya existe en la base de datos
  esNombreIdentico = computed(() => {
    const nom = (this.nombreValue() || '').trim().toLowerCase();

    if (!nom || nom.length < 3) return false;

    return this.clientesExistentes().some(c => 
      c.nombre.trim().toLowerCase() === nom
    );
  });

  solicitarConfirmacion(): void {
    if (this.formularioCliente.invalid || this.esNombreIdentico()) {
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

  const datosCliente: Partial<Cliente> = this.formularioCliente.value;
    const id = this.clienteId();

    const operacion$ = id
      ? this.clientesService.actualizarCliente(id, datosCliente)
      : this.clientesService.crearCliente(datosCliente);

    operacion$.subscribe({
      next: (clienteResultado) => {
        this.isLoading.set(false);
        this.mostrarConfirmacion.set(false);
        this.mensajeExito.set(
          id ? '¡Cliente actualizado exitosamente!' : '¡Cliente guardado exitosamente!'
        );

        this.clienteGuardado.emit(clienteResultado);

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