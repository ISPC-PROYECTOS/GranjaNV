import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Galpon } from '../../../../../core/models/produccion.model';
import { ProduccionService } from '../../../../../core/services/produccion.service';

@Component({
  selector: 'app-galpones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './galpones.html',
  styleUrl: './galpones.css',
})
export class Galpones implements OnInit {
  private readonly produccionService = inject(ProduccionService);
  private readonly fb = inject(FormBuilder);

  readonly galpones = signal<Galpon[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly modalAbierto = signal(false);
  readonly galponEditando = signal<Galpon | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);

  readonly formulario = this.fb.group({
    numero_galpon: [1, [Validators.required, Validators.min(1)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    capacidad_maxima: [1, [Validators.required, Validators.min(1)]],
    cantidad_inicial_gallinas: [0, [Validators.required, Validators.min(0)]],
    descripcion_galpon: [''],
    activo: [true, Validators.required],
  });

  ngOnInit(): void {
    this.cargarGalpones();
  }

  cargarGalpones(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.produccionService.obtenerGalpones().subscribe({
      next: (galpones) => {
        this.galpones.set(galpones);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  abrirAlta(): void {
    const siguienteNumero = Math.max(0, ...this.galpones().map((galpon) => galpon.numero_galpon)) + 1;
    this.galponEditando.set(null);
    this.errorFormulario.set(null);
    this.formulario.reset({
      numero_galpon: siguienteNumero,
      nombre: '',
      capacidad_maxima: 1,
      cantidad_inicial_gallinas: 0,
      descripcion_galpon: '',
      activo: true,
    });
    this.modalAbierto.set(true);
  }

  abrirEdicion(galpon: Galpon): void {
    this.galponEditando.set(galpon);
    this.errorFormulario.set(null);
    this.formulario.reset({
      numero_galpon: galpon.numero_galpon,
      nombre: galpon.nombre,
      capacidad_maxima: galpon.capacidad_maxima,
      cantidad_inicial_gallinas: galpon.cantidad_inicial_gallinas,
      descripcion_galpon: galpon.descripcion_galpon,
      activo: galpon.activo,
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) return;
    this.modalAbierto.set(false);
    this.galponEditando.set(null);
  }

  guardarGalpon(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const galponExistente = this.galponEditando();
    const datos = this.formulario.getRawValue();
    const payload = {
      numero_galpon: Number(datos.numero_galpon),
      nombre: datos.nombre?.trim() ?? '',
      capacidad_maxima: Number(datos.capacidad_maxima),
      cantidad_inicial_gallinas: Number(datos.cantidad_inicial_gallinas),
      descripcion_galpon: datos.descripcion_galpon?.trim() ?? '',
      activo: datos.activo ?? true,
    };

    this.guardando.set(true);
    this.errorFormulario.set(null);
    const solicitud = galponExistente
      ? this.produccionService.actualizarGalpon(galponExistente.id, {
          nombre: payload.nombre,
          capacidad_maxima: payload.capacidad_maxima,
          cantidad_inicial_gallinas: payload.cantidad_inicial_gallinas,
          descripcion_galpon: payload.descripcion_galpon,
          activo: payload.activo,
        })
      : this.produccionService.crearGalpon(payload);

    solicitud.subscribe({
      next: (guardado) => {
        this.galpones.update((galpones) => {
          const existe = galpones.some((galpon) => galpon.id === guardado.id);
          const actualizados = existe
            ? galpones.map((galpon) => galpon.id === guardado.id ? guardado : galpon)
            : [...galpones, guardado];
          return actualizados.sort((a, b) => a.numero_galpon - b.numero_galpon);
        });
        this.guardando.set(false);
        this.cerrarModal();
        this.produccionService.cargarGalpones();
      },
      error: (respuesta: HttpErrorResponse) => {
        const detalle = respuesta.error?.numero_galpon?.[0]
          ?? respuesta.error?.detail;
        this.errorFormulario.set(
          typeof detalle === 'string'
            ? detalle
            : 'No se pudo guardar el galpón. Revisá los datos e intentá de nuevo.',
        );
        this.guardando.set(false);
      },
    });
  }

  porcentajeOcupacion(galpon: Galpon): number {
    if (!galpon.capacidad_maxima) return 0;
    return Math.min(100, Math.round((galpon.cantidad_actual_gallinas / galpon.capacidad_maxima) * 100));
  }

  espaciosDisponibles(galpon: Galpon): number {
    return Math.max(0, galpon.capacidad_maxima - galpon.cantidad_actual_gallinas);
  }
}