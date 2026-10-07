import { Component, EventEmitter, Input, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente, TipoCliente } from '../../core/models/cliente.model';
import { ClienteSugerenciasComponent } from '../clientes-sugerencias/clientes-sugerencias';

const PATRON_TEXTO_PERSONA = '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]{2,}$';
const PATRON_TEXTO_COMERCIO = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\\s\\.\\,\\-]{3,}$';
const PATRON_TELEFONO = '^[0-9\\+\\-\\s]{7,}$';

export type TipoEntidadCliente = 'PERSONA' | 'NEGOCIO';

@Component({
  selector: 'app-crear-cliente',
  imports: [CommonModule, ReactiveFormsModule, ClienteSugerenciasComponent],
  templateUrl: './crear-cliente.html',
  styleUrl: './crear-cliente.css'
})
export class CrearClienteComponent {
  private readonly fb = inject(FormBuilder); 
  private readonly clientesService = inject(ClientesService);

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

      if (!cliente.apellido) {
        this.cambiarTipoEntidad('NEGOCIO');
      } else {
        this.cambiarTipoEntidad('PERSONA');
      }
    } else {
      this.clienteId.set(null);
    }
  }

  @Output() clienteGuardado = new EventEmitter<Cliente>();
  @Output() cerrar = new EventEmitter<void>();

  readonly clienteId = signal<number | null>(null);
  readonly errorBackend = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly mostrarConfirmacion = signal<boolean>(false);
  readonly tipoEntidad = signal<TipoEntidadCliente>('PERSONA');
  readonly mostrarSugerencias = signal<boolean>(false);

  readonly clientesExistentes = signal<Cliente[]>([]);

  readonly formularioCliente: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(PATRON_TEXTO_PERSONA)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(PATRON_TEXTO_PERSONA)]],
    telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO), Validators.minLength(7)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.email]],
    tipo: [TipoCliente.MINORISTA, [Validators.required]]
  });

  private readonly nombreValue = toSignal(this.formularioCliente.get('nombre')!.valueChanges, {
    initialValue: this.formularioCliente.get('nombre')?.value || ''
  });

  private readonly apellidoValue = toSignal(this.formularioCliente.get('apellido')!.valueChanges, {
    initialValue: this.formularioCliente.get('apellido')?.value || ''
  });

  constructor() {
    this.cargarClientes();
  }

  private cargarClientes(): void {
    this.clientesService.obtenerClientes().subscribe({
      next: (data) => this.clientesExistentes.set(data),
      error: (err) => console.error('Error al cargar clientes existentes:', err)
    });
  }

  cambiarTipoEntidad(tipo: TipoEntidadCliente): void {
    this.tipoEntidad.set(tipo);
    const nombreCtrl = this.formularioCliente.get('nombre');
    const apellidoCtrl = this.formularioCliente.get('apellido');

    if (tipo === 'PERSONA') {
      nombreCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(PATRON_TEXTO_PERSONA)
      ]);
      apellidoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(PATRON_TEXTO_PERSONA)
      ]);
    } else {
      nombreCtrl?.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(PATRON_TEXTO_COMERCIO)
      ]);
      apellidoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(PATRON_TEXTO_PERSONA)
      ]);
    }

    nombreCtrl?.updateValueAndValidity();
    apellidoCtrl?.updateValueAndValidity();
  }

  readonly coincidenciasNombre = computed(() => {
    const nomOriginal = (this.nombreValue() || '').trim();
    const nom = nomOriginal.toLowerCase();
    if (!nom || nom.length < 2) return [];

    return this.clientesExistentes().filter(c => 
      c.nombre.toLowerCase().includes(nom) &&
      c.id !== this.clienteId()
    );
  });

  readonly homonimosMismoNombre = computed(() => {
    const nom = (this.nombreValue() || '').trim().toLowerCase();
    const ape = (this.apellidoValue() || '').trim().toLowerCase();

    if (!nom || nom.length < 2) return [];

    return this.clientesExistentes().filter(c => 
      c.nombre.trim().toLowerCase() === nom &&
      (c.apellido || '').trim().toLowerCase() !== ape &&
      c.id !== this.clienteId()
    );
  });

  readonly esHomonimoExacto = computed(() => {
    const nom = (this.nombreValue() || '').trim().toLowerCase();
    const ape = (this.apellidoValue() || '').trim().toLowerCase();

    if (!nom || nom.length < 2 || !ape) return false;

    return this.clientesExistentes().some(c => 
      c.nombre.trim().toLowerCase() === nom &&
      (c.apellido || '').trim().toLowerCase() === ape &&
      c.id !== this.clienteId()
    );
  });

  onInputNombre(): void {
    this.mostrarSugerencias.set(true);
  }

  onSeleccionarSugerencia(cliente: Cliente): void {
    this.formularioCliente.patchValue({
      nombre: cliente.nombre,
      apellido: cliente.apellido || ''
    });
    this.mostrarSugerencias.set(false);
  }

  solicitarConfirmacion(): void {
    if (this.formularioCliente.invalid || this.esHomonimoExacto()) {
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
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.mostrarConfirmacion.set(false);
        const errorMsg =
          err.error?.nombre?.[0] ||
          err.error?.apellido?.[0] ||
          err.error?.detail ||
          'Ocurrió un error al intentar guardar el cliente.';
        this.errorBackend.set(errorMsg);
      }
    });
  }

  limpiar(): void {
    this.formularioCliente.reset({
      tipo: TipoCliente.MINORISTA
    });
    this.cambiarTipoEntidad('PERSONA');
    this.errorBackend.set(null);
    this.mensajeExito.set(null);
    this.mostrarConfirmacion.set(false);
    this.mostrarSugerencias.set(false);
  }

  cerrarFormulario(): void {
    this.cerrar.emit();
  }
}