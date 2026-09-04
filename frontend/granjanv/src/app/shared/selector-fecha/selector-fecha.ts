import { Component, OnInit, output } from '@angular/core';
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
  cambioRango = output<RangoFechaSeleccionado>();

  tipoFiltro: 'mes' | 'rango' = 'mes';
  mesSeleccionado: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  ngOnInit(): void {
    const rango = obtenerRangoMesActual();
    this.mesSeleccionado = rango.fechaDesde.slice(0, 7);
    this.fechaDesde = rango.fechaDesde;
    this.fechaHasta = rango.fechaHasta;
    this.cambioRango.emit(rango);
  }

  onCambioTipo(): void {
    if (this.tipoFiltro === 'mes') {
      this.onCambioMes();
    } else {
      this.aplicarRango();
    }
  }

  onCambioMes(): void {
    if (!this.mesSeleccionado) return;
    const [anio, mes] = this.mesSeleccionado.split('-').map(Number);
    const fechaRef = new Date(anio, mes - 1, 1);
    const rango = obtenerRangoMesActual(fechaRef);
    this.cambioRango.emit(rango);
  }

  aplicarRango(): void {
    if (this.fechaDesde && this.fechaHasta) {
      this.cambioRango.emit({
        fechaDesde: this.fechaDesde,
        fechaHasta: this.fechaHasta,
      });
    }
  }
}