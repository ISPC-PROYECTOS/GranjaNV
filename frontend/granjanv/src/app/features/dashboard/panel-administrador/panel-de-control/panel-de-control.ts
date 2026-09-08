import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Gastos } from '../../../../core/services/gastos';
import { PedidosService } from '../../../../core/services/pedidos.service';

export interface MetricaDashboard {
  titulo: string;
  valor: string;
  icono: string;
  color: 'naranja' | 'verde';
  ruta: string | null;
}

@Component({
  selector: 'app-panel-de-control',
  imports: [RouterLink],
  templateUrl: './panel-de-control.html',
  styleUrl: './panel-de-control.css',
})
export class PanelDeControl implements OnInit {
  private readonly gastosService = inject(Gastos);
  private readonly pedidosService = inject(PedidosService);

  readonly totalCompras = signal<number>(0);
  readonly totalVentasCobradas = signal<number>(0);
  readonly pedidosPendientesCount = signal<number>(0);

  readonly metricas = computed<MetricaDashboard[]>(() => [
    {
      titulo: 'PEDIDOS PENDIENTES',
      valor: this.pedidosPendientesCount().toString(),
      icono: 'hgi-task-01',
      color: 'naranja',
      ruta: '/dashboard/admin/ventas',
    },
    {
      titulo: 'VENTAS',
      valor: `$${this.formatearNumero(this.totalVentasCobradas())}`,
      icono: 'hgi-money-receive-02',
      color: 'verde',
      ruta: '/dashboard/admin/ventas',
    },
    {
      titulo: 'COMPRAS',
      valor: `-$${this.formatearNumero(this.totalCompras())}`,
      icono: 'hgi-shopping-cart-01',
      color: 'naranja',
      ruta: '/dashboard/admin/finanzas',
    },
    {
      titulo: 'PRODUCCIÓN',
      valor: '283',
      icono: 'hgi-eggs',
      color: 'verde',
      ruta: null,
    },
  ]);

  ngOnInit(): void {
    this.cargarMetricasDashboard();
  }

  cargarMetricasDashboard(): void {
    this.gastosService.obtenerTotalGastos().subscribe({
      next: (respuesta) => {
        this.totalCompras.set(Number(respuesta.total) || 0);
      },
      error: (error: unknown) => {
        console.error('Error al obtener el total de compras:', error);
      },
    });

    this.pedidosService.obtenerMetricas().subscribe({
      next: (data) => {
        this.pedidosPendientesCount.set(data.pedidos_pendientes);
        this.totalVentasCobradas.set(Number(data.total_ventas_cobradas) || 0);
      },
      error: (error: unknown) => {
        console.error('Error al obtener las métricas de ventas y pedidos:', error);
      },
    });
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