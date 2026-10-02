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
    if (this.reporteSeleccionado !== 'finanzas') {
      console.log('Reporte todavía no conectado:', this.reporteSeleccionado);
      return;
    }

    const solicitud =
      this.formatoSeleccionado === 'pdf'
        ? this.reportesService.exportarFinanzasPdf(
            this.rangoSeleccionado.fechaDesde,
            this.rangoSeleccionado.fechaHasta,
          )
        : this.reportesService.exportarFinanzasExcel(
            this.rangoSeleccionado.fechaDesde,
            this.rangoSeleccionado.fechaHasta,
          );

    solicitud.subscribe({
      next: (archivo) => {
        const extension = this.formatoSeleccionado === 'pdf' ? 'pdf' : 'xlsx';

        const url = URL.createObjectURL(archivo);

        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte_finanzas.${extension}`;
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
