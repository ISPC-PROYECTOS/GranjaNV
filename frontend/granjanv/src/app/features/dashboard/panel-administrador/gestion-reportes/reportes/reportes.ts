import { Component, inject, signal } from '@angular/core';
import {
  RangoFechaSeleccionado,
  SelectorFecha,
} from '../../../../../shared/selector-fecha/selector-fecha';
import { obtenerRangoMesActual } from '../../../../../core/utils/date.utils';
import { ReportesService } from '../../../../../core/services/reportes.service';
import { CerrarConEscapeDirective } from '../../../../../shared/directives/cerrar-con-escape.directive';
import {
  ReporteCompleto,
  ReporteFinanzas,
  ReporteProduccion,
} from '../../../../../core/models/reporte.model';
import { Spinner } from '../../../../../shared/spinner/spinner';

type TipoReporte = 'produccion' | 'finanzas' | 'completo';
type FormatoReporte = 'pdf' | 'excel';

@Component({
  selector: 'app-reportes',
  imports: [SelectorFecha, CerrarConEscapeDirective, Spinner],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  private reportesService = inject(ReportesService);

  mostrarModal = signal(false);
  reporteSeleccionado = signal<TipoReporte | null>(null);
  rangoSeleccionado = signal<RangoFechaSeleccionado>(obtenerRangoMesActual());
  rangoTemporal = signal<RangoFechaSeleccionado>(obtenerRangoMesActual());
  formatoSeleccionado = signal<FormatoReporte>('pdf');

  confirmandoExportacion = signal(false);
  exportando = signal(false);

  cargandoVistaPrevia = signal(false);

  vistaPreviaFinanzas = signal<ReporteFinanzas | null>(null);
  vistaPreviaProduccion = signal<ReporteProduccion | null>(null);
  vistaPreviaCompleto = signal<ReporteCompleto | null>(null);

  abrirModal(tipo: TipoReporte): void {
    this.reporteSeleccionado.set(tipo);
    this.confirmandoExportacion.set(false);
    this.exportando.set(false);
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    if (this.exportando()) {
      return;
    }

    this.mostrarModal.set(false);
    this.reporteSeleccionado.set(null);
    this.confirmandoExportacion.set(false);
  }

  onCambioRango(rango: RangoFechaSeleccionado): void {
    this.rangoTemporal.set(rango);
  }

  seleccionarRango(): void {
    this.rangoSeleccionado.set(this.rangoTemporal());
  }

  onCambioFormato(formato: FormatoReporte): void {
    this.formatoSeleccionado.set(formato);
  }

  obtenerTituloModal(): string {
    switch (this.reporteSeleccionado()) {
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

  solicitarExportacion(): void {
    this.vistaPreviaFinanzas.set(null);
    this.vistaPreviaProduccion.set(null);
    this.vistaPreviaCompleto.set(null);

    this.confirmandoExportacion.set(true);
    this.cargarVistaPrevia();
  }

  volverAConfiguracion(): void {
    this.confirmandoExportacion.set(false);
  }

  formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  cargarVistaPrevia(): void {
    const tipoReporte = this.reporteSeleccionado();

    if (!tipoReporte) {
      return;
    }

    const rango = this.rangoSeleccionado();

    this.cargandoVistaPrevia.set(true);

    if (tipoReporte === 'finanzas') {
      this.reportesService.obtenerReporteFinanzas(rango.fechaDesde, rango.fechaHasta).subscribe({
        next: (datos) => {
          this.vistaPreviaFinanzas.set(datos);
          this.cargandoVistaPrevia.set(false);
        },
        error: (error) => {
          console.error('Error al cargar la vista previa:', error);
          this.cargandoVistaPrevia.set(false);
        },
      });

      return;
    }

    if (tipoReporte === 'produccion') {
      this.reportesService.obtenerReporteProduccion(rango.fechaDesde, rango.fechaHasta).subscribe({
        next: (datos) => {
          this.vistaPreviaProduccion.set(datos);
          this.cargandoVistaPrevia.set(false);
        },
        error: (error) => {
          console.error('Error al cargar la vista previa:', error);
          this.cargandoVistaPrevia.set(false);
        },
      });

      return;
    }

    this.reportesService.obtenerReporteCompleto(rango.fechaDesde, rango.fechaHasta).subscribe({
      next: (datos) => {
        this.vistaPreviaCompleto.set(datos);
        this.cargandoVistaPrevia.set(false);
      },
      error: (error) => {
        console.error('Error al cargar la vista previa:', error);
        this.cargandoVistaPrevia.set(false);
      },
    });
  }

  exportarReporte(): void {
    const tipoReporte = this.reporteSeleccionado();

    if (!tipoReporte || this.exportando()) {
      return;
    }

    const rango = this.rangoSeleccionado();
    const formato = this.formatoSeleccionado();

    this.exportando.set(true);

    this.reportesService
      .exportarReporte(tipoReporte, formato, rango.fechaDesde, rango.fechaHasta)
      .subscribe({
        next: (archivo) => {
          const extension = formato === 'pdf' ? 'pdf' : 'xlsx';

          const url = URL.createObjectURL(archivo);

          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `reporte_${tipoReporte}.${extension}`;

          enlace.click();

          URL.revokeObjectURL(url);

          this.exportando.set(false);
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al exportar el reporte:', error);
          this.exportando.set(false);
        },
      });
  }
}
