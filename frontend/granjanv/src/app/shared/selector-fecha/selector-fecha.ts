import { Component, OnInit, Input, output, input, ElementRef, inject, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { obtenerRangoMesActual } from '../../core/utils/date.utils';

export interface RangoFechaSeleccionado {
  fechaDesde: string;
  fechaHasta: string;
}

@Component({
  selector: 'app-selector-fecha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-fecha.html',
  styleUrl: './selector-fecha.css',
})
export class SelectorFecha implements OnInit {
  private elementRef = inject(ElementRef);

  @Input() permitirTodos: boolean = false;
  @Input() emitirAlIniciar: boolean = true;
  @Input() maxFecha?: string;

  cambioRango = output<RangoFechaSeleccionado>();
  modoSeleccion = input(false);
  seleccionar = output<void>();

  tipoFiltro: 'todos' | 'mes' | 'rango' = 'mes';
  mesSeleccionado: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  ngOnInit(): void {
    const rango = obtenerRangoMesActual();

    this.mesSeleccionado = rango.fechaDesde.slice(0, 7);
    this.fechaDesde = rango.fechaDesde;
    this.fechaHasta = rango.fechaHasta;

    if (this.emitirAlIniciar) {
      if (this.permitirTodos) {
        this.tipoFiltro = 'todos';
        this.cambioRango.emit({ fechaDesde: '', fechaHasta: '' });
      } else {
        this.cambioRango.emit(rango);
      }
    }
  }

  onCambioTipo(): void {
    if (this.tipoFiltro === 'mes' && !this.mesSeleccionado) {
      this.mesSeleccionado = obtenerRangoMesActual().fechaDesde.slice(0, 7);
    }
  }

  confirmarSeleccion(): void {
    let rango: RangoFechaSeleccionado;

    if (this.tipoFiltro === 'todos') {
      rango = { fechaDesde: '', fechaHasta: '' };
    } else if (this.tipoFiltro === 'mes') {
      if (!this.mesSeleccionado) return;

      const [anio, mes] = this.mesSeleccionado.split('-').map(Number);
      rango = obtenerRangoMesActual(new Date(anio, mes - 1, 1));
    } else {
      if (!this.fechaDesde || !this.fechaHasta) return;
      if (this.fechaDesde > this.fechaHasta) return;

      rango = {
        fechaDesde: this.fechaDesde,
        fechaHasta: this.fechaHasta,
      };
    }

    this.cambioRango.emit(rango);
    this.seleccionar.emit();
    this.cerrarSelector();
  }

  restablecerFiltro(): void {
    const rango = obtenerRangoMesActual();

    this.mesSeleccionado = rango.fechaDesde.slice(0, 7);
    this.fechaDesde = rango.fechaDesde;
    this.fechaHasta = rango.fechaHasta;

    if (this.permitirTodos) {
      this.tipoFiltro = 'todos';
      this.cambioRango.emit({ fechaDesde: '', fechaHasta: '' });
    } else {
      this.tipoFiltro = 'mes';
      this.cambioRango.emit(rango);
    }

    this.seleccionar.emit();
    this.cerrarSelector();
  }

  private cerrarSelector(): void {
    const boton = this.elementRef.nativeElement.querySelector('.selector-fecha-caja');

    if (boton?.getAttribute('aria-expanded') === 'true') {
      boton.click();
    }
  }
}
