import { Component, inject } from '@angular/core';
import {
  RangoFechaSeleccionado,
  SelectorFecha,
} from '../../../../../shared/selector-fecha/selector-fecha';
import { obtenerRangoMesActual } from '../../../../../core/utils/date.utils';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../../../../core/services/reportes.service';

type TipoReporte = 'produccion' | 'finanzas' | 'completo';

@Component({
  selector: 'app-reportes',
  imports: [SelectorFecha, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  private reportesService = inject(ReportesService);

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
    if (!this.reporteSeleccionado) {
      return;
    }

    if (this.reporteSeleccionado === 'completo') {
      console.log('Informe completo todavía no conectado');
      return;
    }

    const fechaDesde = this.rangoSeleccionado.fechaDesde;
    const fechaHasta = this.rangoSeleccionado.fechaHasta;

    this.reportesService
      .exportarReporte(this.reporteSeleccionado, this.formatoSeleccionado, fechaDesde, fechaHasta)
      .subscribe({
        next: (archivo) => {
          const extension = this.formatoSeleccionado === 'pdf' ? 'pdf' : 'xlsx';

          const url = URL.createObjectURL(archivo);

          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `reporte_${this.reporteSeleccionado}.${extension}`;

          enlace.click();

          URL.revokeObjectURL(url);
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al exportar el reporte:', error);
        },
      });
  }
}
