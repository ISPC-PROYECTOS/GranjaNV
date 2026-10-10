import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Gastos } from '../../../../core/services/gastos';
import { PedidosService } from '../../../../core/services/pedidos.service';
import { ProduccionService } from '../../../../core/services/produccion.service';
import { obtenerRangoMesActual } from '../../../../core/utils/date.utils';
import { Spinner } from '../../../../shared/spinner/spinner';

export interface MetricaItem {
  titulo: string;
  valor: string;
  color: 'verde' | 'naranja';
  icono: string;
  ruta?: string;
  queryParams?: Record<string, string>;
  subtexto?: string; // Opcional para Alternativa A
  esCarrusel?: boolean; // Opcional para Alternativa B
}

@Component({
  selector: 'app-panel-de-control',
  imports: [RouterLink, Spinner],
  templateUrl: './panel-de-control.html',
  styleUrl: './panel-de-control.css',
})
export class PanelDeControl implements OnInit {
  readonly cargando = signal(true);
  private readonly gastosService = inject(Gastos);
  private readonly pedidosService = inject(PedidosService);
  private readonly produccionService = inject(ProduccionService);

  readonly totalCompras = signal<number>(0);
  readonly totalVentasCobradas = signal<number>(0);
  readonly pedidosPendientesCount = signal<number>(0);
  readonly ventasMesActual = signal<number>(0);
  readonly ventasMesAnterior = signal<number>(0);

  readonly metricas = computed<MetricaItem[]>(() => [
    {
      titulo: 'PEDIDOS PENDIENTES',
      valor: this.pedidosPendientesCount().toString(),
      icono: 'hgi-task-01',
      color: 'naranja',
      ruta: '/dashboard/admin/ventas',
      queryParams: {seccion: 'pendientes'},
    },
    {
      titulo: 'Ventas',
      valor: `$${this.formatearNumero(this.ventasMesActual())}`,
      subtexto: `Mes anterior: $${this.formatearNumero(this.ventasMesAnterior())}`,
      color: 'verde',
      icono: 'hgi-dollar-circle',
      ruta: '/dashboard/admin/ventas',
      queryParams: { seccion: 'pendientes' }
    },
    {
      titulo: 'COMPRAS',
      valor: `-$${this.formatearNumero(this.totalCompras())}`,
      icono: 'hgi-shopping-cart-01',
      color: 'naranja',
      ruta: '/dashboard/admin/finanzas',
    },
    {
      titulo: 'STOCK TOTAL MAPLES',
      valor: this.formatearNumero(this.produccionService.datosProduccion().total_maples),
      icono: 'hgi-eggs',
      color: 'verde',
      ruta: '/dashboard/produccion',
    },
  ]);

  ngOnInit(): void {
    this.cargarMetricasDashboard();
  }

  cargarMetricasDashboard(): void {
    const rangoMesActual = obtenerRangoMesActual();
    this.cargando.set(true);

    this.gastosService.obtenerTotalGastos(rangoMesActual).subscribe({
      next: (respuesta) => {
        this.totalCompras.set(Number(respuesta.total) || 0);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        console.error('Error al obtener el total de compras:', error);
      },
    });

    this.pedidosService.obtenerMetricas().subscribe({
      next: (data) => {
        this.pedidosPendientesCount.set(data.pedidos_pendientes);
        this.ventasMesActual.set(Number(data.ventas_mes_actual ?? data.total_ventas_cobradas));
        this.ventasMesAnterior.set(Number(data.ventas_mes_anterior ?? 0));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar pedidos:', err);
      }
    });

    this.produccionService.cargarMetricasProduccion();
  }

  formatearNumero(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '0';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return '0';

    return Math.round(numero)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}