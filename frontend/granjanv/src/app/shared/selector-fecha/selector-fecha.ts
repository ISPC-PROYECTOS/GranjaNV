import { Component, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { obtenerRangoMesActual, obtenerRangoSemanaActual } from '../../core/utils/date.utils';

export interface RangoFechaSeleccionado {
  fechaDesde: string;
  fechaHasta: string;
}

@Component({
  selector: 'app-selector-fecha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-fecha.html',
  styleUrl: './selector-fecha.css',
})
export class SelectorFecha implements OnInit {
  modo = input<'mes' | 'semana'>('mes');
  cambioRango = output<RangoFechaSeleccionado>();

  valorInput: string = '';

  ngOnInit(): void {
    if (this.modo() === 'mes') {
      const rango = obtenerRangoMesActual();
      this.valorInput = rango.fechaDesde.slice(0, 7);
      this.cambioRango.emit(rango);
    } else {
      const rango = obtenerRangoSemanaActual();
      this.valorInput = rango.fechaDesde;
      this.cambioRango.emit(rango);
    }
  }

  onInputFecha(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.value) return;

    this.valorInput = inputEl.value;

    if (this.modo() === 'mes') {
      const partes = inputEl.value.split('-');
      const anio = Number(partes[0]);
      const mes = Number(partes[1]);
      if (!isNaN(anio) && !isNaN(mes)) {
        const fechaRef = new Date(anio, mes - 1, 1);
        const rango = obtenerRangoMesActual(fechaRef);
        this.cambioRango.emit(rango);
      }
    } else {
      const partes = inputEl.value.split('-');
      const anio = Number(partes[0]);
      const mes = Number(partes[1]);
      const dia = Number(partes[2]);
      if (!isNaN(anio) && !isNaN(mes) && !isNaN(dia)) {
        const fechaRef = new Date(anio, mes - 1, dia);
        const rango = obtenerRangoSemanaActual(fechaRef);
        this.cambioRango.emit(rango);
      }
    }
  }
}
