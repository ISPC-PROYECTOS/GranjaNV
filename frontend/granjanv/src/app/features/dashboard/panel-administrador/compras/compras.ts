import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { Gasto } from '../../../../core/models/gasto.model';
import { Gastos, FiltroGastos } from '../../../../core/services/gastos';
import { formatearFechaISO, obtenerRangoMesActual } from '../../../../core/utils/date.utils';
import {
  SelectorFecha,
  RangoFechaSeleccionado,
} from '../../../../shared/selector-fecha/selector-fecha';
import { Buscador } from '../../../../shared/buscador/buscador';

@Component({
  selector: 'app-compras',
  imports: [ReactiveFormsModule, RouterLink, SelectorFecha, Buscador],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras implements OnInit, OnDestroy {
  private gastosService = inject(Gastos);
  private cdr = inject(ChangeDetectorRef);

  formularioGastos: FormGroup;

  fechaMaxima = formatearFechaISO(new Date());

  rangoActual: RangoFechaSeleccionado = obtenerRangoMesActual();
  terminoBusqueda: string = '';

  gastos: Gasto[] = [];
  totalGastos: number = 0;
  gastoEditandoId: number | null = null;
  mostrarConfirmacion = false;
  mostrarConfirmacionEliminar = false;
  isGuardando = false;
  gastoPendienteGuardar: Partial<Gasto> | null = null;
  gastoAEliminar: Gasto | null = null;

  private buscadorSubject = new Subject<string>();
  private buscadorSub!: Subscription;

  vistaMobile: 'formulario' | 'gastos' = 'formulario';

  constructor(private fb: FormBuilder) {
    this.formularioGastos = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fecha: [this.fechaMaxima, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();

    this.buscadorSub = this.buscadorSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.cargarDatos();
      });
  }

  ngOnDestroy(): void {
    if (this.buscadorSub) {
      this.buscadorSub.unsubscribe();
    }
  }

  onBuscar(valor: string): void {
    this.buscadorSubject.next(valor);
  }

  onCambioRangoFecha(rango: RangoFechaSeleccionado): void {
    this.rangoActual = rango;
    this.cargarDatos();
  }

  private obtenerFiltrosActivos(): FiltroGastos {
    return {
      search: this.terminoBusqueda,
      fechaDesde: this.rangoActual.fechaDesde,
      fechaHasta: this.rangoActual.fechaHasta,
    };
  }

  cargarDatos(): void {
    const filtros = this.obtenerFiltrosActivos();

    this.gastosService.obtenerGastos(filtros).subscribe({
      next: (gastos) => {
        this.gastos = gastos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener los gastos:', error);
      },
    });

    this.gastosService.obtenerTotalGastos(filtros).subscribe({
      next: (respuesta) => {
        this.totalGastos = Number(respuesta.total);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener el total de gastos:', error);
      },
    });
  }

  mensajeExito: string | null = null;
  private timerExito: any = null;

  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    if (this.timerExito) clearTimeout(this.timerExito);
    this.timerExito = setTimeout(() => {
      this.mensajeExito = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  guardarGasto(): void {
    if (this.formularioGastos.valid) {
      this.gastoPendienteGuardar = this.formularioGastos.value;
      this.mostrarConfirmacion = true;
    } else {
      this.formularioGastos.markAllAsTouched();
    }
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.gastoPendienteGuardar = null;
  }

  confirmarYGuardar(): void {
    const gasto = this.gastoPendienteGuardar;
    if (!gasto) return;

    this.isGuardando = true;
      if (this.gastoEditandoId !== null) {
        this.gastosService.actualizarGasto(this.gastoEditandoId, gasto).subscribe({
          next: () => {
            this.isGuardando = false;
            this.cancelarConfirmacion();
            this.cargarDatos();
            this.limpiarFormulario();
            this.mostrarExito('¡Gasto actualizado con éxito!');
          },
          error: (error) => {
            this.isGuardando = false;
            console.error('Error al actualizar el gasto:', error);
          },
        });
      } else {
        this.gastosService.crearGasto(gasto).subscribe({
          next: () => {
            this.isGuardando = false;
            this.cancelarConfirmacion();
            this.cargarDatos();
            this.limpiarFormulario();
            this.mostrarExito('¡Gasto cargado con éxito!');
          },
          error: (error) => {
            this.isGuardando = false;
            console.error('Error al guardar el gasto:', error);
          },
        });
      }
  }

  solicitarEliminacion(gasto: Gasto): void {
    this.gastoAEliminar = gasto;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacionEliminar = false;
    this.gastoAEliminar = null;
  }

  confirmarEliminacion(): void {
    const gasto = this.gastoAEliminar;
    if (!gasto) return;

    this.gastosService.eliminarGasto(gasto.id).subscribe({
      next: () => {
        this.cancelarEliminacion();
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al eliminar el gasto:', error);
      },
    });
  }

  editarGasto(gasto: Gasto): void {
    this.gastoEditandoId = gasto.id;

    this.formularioGastos.patchValue({
      monto: Number(gasto.monto),
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      fecha: gasto.fecha,
    });

    this.vistaMobile = 'formulario';

    setTimeout(() => {
      const formulario = document.getElementById('form-gasto');
      formulario?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('monto')?.focus();
    }, 50);
  }

  limpiarFormulario(): void {
    this.formularioGastos.reset({
      fecha: this.fechaMaxima,
    });
    this.gastoEditandoId = null;
  }

  obtenerCategoriaLabel(categoria: string | undefined): string {
    const categorias: Record<string, string> = {
      ALIMENTO: 'Alimento',
      COMBUSTIBLE: 'Combustible',
      INSUMOS: 'Insumos Veterinarios',
      MANTENIMIENTO: 'Mantenimiento / Ferretería',
      LIMPIEZA: 'Artículos de Limpieza',
      OTROS: 'Otros',
    };
    return categorias[categoria ?? ''] ?? categoria ?? '';
  }

  formatearNumero(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '0,00';

    const numero = Number(valor);
    if (isNaN(numero)) return '0,00';

    const [enteros, decimales] = numero.toFixed(2).split('.');
    const enterosConPuntos = (enteros ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${enterosConPuntos},${decimales ?? '00'}`;
  }

  mostrarFormulario(): void {
    this.vistaMobile = 'formulario';
  }

  mostrarGastos(): void {
    this.vistaMobile = 'gastos';
  }
}
