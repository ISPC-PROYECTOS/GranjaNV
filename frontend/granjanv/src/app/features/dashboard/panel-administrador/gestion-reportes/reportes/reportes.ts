import { Component } from '@angular/core';
import {
  RangoFechaSeleccionado,
  SelectorFecha,
} from '../../../../../shared/selector-fecha/selector-fecha';
import { obtenerRangoMesActual } from '../../../../../core/utils/date.utils';
import { FormsModule } from '@angular/forms';

type TipoReporte = 'produccion' | 'finanzas' | 'completo';

@Component({
  selector: 'app-reportes',
  imports: [SelectorFecha, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  mostrarModal = false;
  reporteSeleccionado: TipoReporte | null = null;
  rangoSeleccionado: RangoFechaSeleccionado = obtenerRangoMesActual();
  formatoSeleccionado: 'pdf' | 'excel' = 'pdf';

  abrirModal(tipo: TipoReporte): void {
    this.reporteSeleccionado = tipo;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteSeleccionado = null;
  }

  onCambioRango(rango: RangoFechaSeleccionado): void {
    this.rangoSeleccionado = rango;
  }

  obtenerTituloModal(): string {
    switch (this.reporteSeleccionado) {
      case 'produccion':
        return 'Exportar reporte de Producción';

      case 'finanzas':
        return 'Exportar reporte de Finanzas';

      case 'completo':
        return 'Exportar informe completo';

      default:
        return 'Exportar reporte';
    }
  }

  exportarReporte(): void {
    console.log({
      tipo: this.reporteSeleccionado,
      formato: this.formatoSeleccionado,
      fechaDesde: this.rangoSeleccionado.fechaDesde,
      fechaHasta: this.rangoSeleccionado.fechaHasta,
    });
  }
}
