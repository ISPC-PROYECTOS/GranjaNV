import { Component, OnInit, signal, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService, MetricasComerciales } from '../../../../../core/services/reporte.service';

export interface IndicadorClave {
    titulo: string;
    valor: string;
    subtexto: string;
    icono: string;
}

@Component({
  selector: 'app-metricas',
  standalone: true,
  templateUrl: './metricas.html',
  styleUrl: './metricas.css'
})
export class Metricas implements OnInit {
    private reportesService = inject(ReportesService);

  readonly totalVentasMes = signal<number>(0);
  readonly porcentajeVentasVsMesAnterior = signal<number>(0);
  readonly produccionDiariaPromedio = signal<number>(0);
  readonly gananciaNetaMes = signal<number>(0);

  ngOnInit(): void {
    this.cargarMetricasDesdeBackend();
  }

  cargarMetricasDesdeBackend() {
    this.reportesService.getMetricasComerciales().subscribe({
      next: (data) => {
        // Actualizamos las señales con los valores reales que devuelve Django
        this.totalVentasMes.set(Number(data.ventas_del_mes));
        this.porcentajeVentasVsMesAnterior.set(Number(data.porcentaje_cambio_ventas));
        this.produccionDiariaPromedio.set(Number(data.produccion_diaria_promedio));
        this.gananciaNetaMes.set(Number(data.ganancia_neta_mensual));
      },
      error: (err) => {
        console.error('Error al cargar las métricas desde la API:', err);
      }
    });
  }

  // Lista armada para dibujar las 3 tarjetas superiores de forma limpia
  readonly tarjetasKpi = computed<IndicadorClave[]>(() => [
    {
      titulo: 'VENTAS DEL MES',
      valor: `$${this.formatearNumero(this.totalVentasMes())}`,
      subtexto: `+ ${this.porcentajeVentasVsMesAnterior()}% vs mes anterior`,
      icono: 'hgi-ticket-02',
    },
    {
      titulo: 'PRODUCCIÓN PROMEDIO',
      valor: this.produccionDiariaPromedio().toString(),
      subtexto: 'Maples por día',
      icono: 'hgi-analytics-01',
    },
    {
      titulo: 'GANANCIA NETA',
      valor: `$${this.formatearNumero(this.gananciaNetaMes())}`,
      subtexto: 'Mensual',
      icono: 'hgi-calculate',
    },
  ]);

  // Función para dar formato con puntos de miles (ej: 137.000)
  formatearNumero(valor: number): string {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

}