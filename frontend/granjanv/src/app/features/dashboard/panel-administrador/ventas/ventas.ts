import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PedidosService } from '../../../../core/services/pedidos.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Cliente } from '../../../../core/models/cliente.model';
import {
  PedidoRead,
  ProductoCatalogo,
  TipoHuevo,
  PedidoWritePayload,
  ItemPedidoWrite,
  OpcionDiaEntrega,
} from '../../../../core/models/pedido.model';
import {
  SelectorFecha,
  RangoFechaSeleccionado,
} from '../../../../shared/selector-fecha/selector-fecha';
import { formatearFechaISO, obtenerRangoMesActual } from '../../../../core/utils/date.utils';
import { Buscador } from '../../../../shared/buscador/buscador';

@Component({
  selector: 'app-ventas',
  imports: [CommonModule, FormsModule, RouterLink, SelectorFecha, Buscador],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly clientesService = inject(ClientesService);

  readonly vistaMobile = signal<'pedidos' | 'formulario'>('formulario');

  // Estados de datos
  readonly pedidosPendientes = signal<PedidoRead[]>([]);
  readonly pedidosCerrados = signal<PedidoRead[]>([]);
  readonly clientes = signal<Cliente[]>([]);

  // Filtros independientes
  readonly busquedaPendientes = signal<string>('');
  readonly rangoPendientes = signal<RangoFechaSeleccionado>(obtenerRangoMesActual());

  readonly busquedaCerrados = signal<string>('');
  readonly rangoCerrados = signal<RangoFechaSeleccionado>(obtenerRangoMesActual());

  readonly isLoading = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly errorBackend = signal<string | null>(null);

  readonly pedidoExpandidoId = signal<number | null>(null);
  readonly pedidoEditandoId = signal<number | null>(null);
  readonly clienteSeleccionado = signal<Cliente | null>(null);
  readonly terminoBusquedaCliente = signal<string>('');
  readonly mostrarCerrados = signal<boolean>(false);

  readonly fechaMinima = formatearFechaISO(new Date());
  readonly fechaEntregaSeleccionada = signal<string>(this.fechaMinima);
  readonly opcionesProximosDias = signal<OpcionDiaEntrega[]>(this.generarProximosDias());

  readonly productos = signal<ProductoCatalogo[]>([
    { codigo: 'BLANCO_1', nombre: 'Blanco 1', precioMaple: 4500, maples: 0 },
    { codigo: 'BLANCO_2', nombre: 'Blanco 2', precioMaple: 4200, maples: 0 },
    { codigo: 'COLOR_1', nombre: 'Color 1', precioMaple: 4800, maples: 0 },
    { codigo: 'COLOR_2', nombre: 'Color 2', precioMaple: 4500, maples: 0 },
  ]);

  readonly precioTotal = computed(() =>
    this.productos().reduce((acc, p) => acc + p.maples * p.precioMaple, 0),
  );

  readonly cantidadTotalMaples = computed(() =>
    this.productos().reduce((acc, p) => acc + p.maples, 0),
  );

  readonly clientesFiltrados = computed(() => {
    const q = this.terminoBusquedaCliente().toLowerCase().trim();
    if (!q) return [];
    return this.clientes().filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) || (c.apellido && c.apellido.toLowerCase().includes(q)),
    );
  });

  ngOnInit(): void {
    this.cargarPedidosPendientes();
    this.cargarPedidosCerrados();
    this.cargarClientes();
  }

  cargarPedidosPendientes(): void {
    this.isLoading.set(true);
    this.pedidosService
      .obtenerPedidos({
        search: this.busquedaPendientes(),
        fechaDesde: this.rangoPendientes().fechaDesde,
        fechaHasta: this.rangoPendientes().fechaHasta,
        pendientes: true,
      })
      .subscribe({
        next: (pedidos) => {
          this.pedidosPendientes.set(pedidos);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  cargarPedidosCerrados(): void {
    this.pedidosService
      .obtenerPedidos({
        search: this.busquedaCerrados(),
        fechaDesde: this.rangoCerrados().fechaDesde,
        fechaHasta: this.rangoCerrados().fechaHasta,
        cerrados: true,
      })
      .subscribe({
        next: (pedidos) => this.pedidosCerrados.set(pedidos),
      });
  }

  cargarClientes(): void {
    this.clientesService.obtenerClientes().subscribe({
      next: (data) => this.clientes.set(data),
    });
  }

  onBuscarPendientes(valor: string): void {
    this.busquedaPendientes.set(valor);
    this.cargarPedidosPendientes();
  }

  onCambioRangoPendientes(rango: RangoFechaSeleccionado): void {
    this.rangoPendientes.set(rango);
    this.cargarPedidosPendientes();
  }

  onBuscarCerrados(valor: string): void {
    this.busquedaCerrados.set(valor);
    this.cargarPedidosCerrados();
  }

  onCambioRangoCerrados(rango: RangoFechaSeleccionado): void {
    this.rangoCerrados.set(rango);
    this.cargarPedidosCerrados();
  }

  toggleExpandir(id: number): void {
    this.pedidoExpandidoId.update((prev) => (prev === id ? null : id));
  }

  toggleMostrarCerrados(): void {
    this.mostrarCerrados.update((v) => !v);
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado.set(cliente);
    const apellido = cliente.apellido ? ` ${cliente.apellido}` : '';
    this.terminoBusquedaCliente.set(`${cliente.nombre}${apellido}`);
  }

  seleccionarDiaEntrega(fechaIso: string): void {
    this.fechaEntregaSeleccionada.set(fechaIso);
  }

  incrementarProducto(codigo: TipoHuevo): void {
    this.productos.update((items) =>
      items.map((i) => (i.codigo === codigo ? { ...i, maples: i.maples + 1 } : i)),
    );
  }

  decrementarProducto(codigo: TipoHuevo): void {
    this.productos.update((items) =>
      items.map((i) => (i.codigo === codigo && i.maples > 0 ? { ...i, maples: i.maples - 1 } : i)),
    );
  }

  guardarPedido(): void {
    const cliente = this.clienteSeleccionado();
    if (!cliente?.id) {
      this.errorBackend.set('Seleccioná un cliente válido de la lista.');
      return;
    }

    if (!this.fechaEntregaSeleccionada()) {
      this.errorBackend.set('La fecha de entrega programada es obligatoria.');
      return;
    }

    const itemsValidos: ItemPedidoWrite[] = this.productos()
      .filter((p) => p.maples > 0)
      .map((p) => ({ tipo_huevo: p.codigo, cantidad_maples: p.maples }));

    if (itemsValidos.length === 0) {
      this.errorBackend.set('Agregá al menos un maple al pedido.');
      return;
    }

    this.errorBackend.set(null);
    const payload: PedidoWritePayload = {
      cliente: cliente.id,
      fecha_entrega: this.fechaEntregaSeleccionada(),
      items: itemsValidos,
    };

    const editId = this.pedidoEditandoId();
    if (editId) {
      this.pedidosService.actualizarPedido(editId, payload).subscribe({
        next: () => {
          this.mostrarNotificacion('¡Pedido actualizado con éxito!');
          this.limpiar();
          this.cargarPedidosPendientes();
          this.cargarPedidosCerrados();
          this.vistaMobile.set('pedidos');
        },
        error: (err) =>
          this.errorBackend.set(err.error?.detail || 'Error al actualizar el pedido.'),
      });
    } else {
      this.pedidosService.crearPedido(payload).subscribe({
        next: () => {
          this.mostrarNotificacion('¡Pedido creado con éxito!');
          this.limpiar();
          this.cargarPedidosPendientes();
          this.cargarPedidosCerrados();
          this.vistaMobile.set('pedidos');
        },
        error: (err) => this.errorBackend.set(err.error?.detail || 'Error al guardar el pedido.'),
      });
    }
  }

  editarPedido(pedido: PedidoRead): void {
    this.pedidoEditandoId.set(pedido.id);
    this.clienteSeleccionado.set(pedido.cliente);
    this.terminoBusquedaCliente.set(
      `${pedido.cliente.nombre} ${pedido.cliente.apellido || ''}`.trim(),
    );
    this.fechaEntregaSeleccionada.set(pedido.fecha_entrega);

    this.productos.update((catalogo) =>
      catalogo.map((item) => {
        const encontrado = pedido.items.find((i) => i.tipo_huevo === item.codigo);
        return { ...item, maples: encontrado ? encontrado.cantidad_maples : 0 };
      }),
    );

    this.vistaMobile.set('formulario');
  }

  eliminarPedido(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      this.pedidosService.eliminarPedido(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Pedido eliminado correctamente.');
          this.cargarPedidosPendientes();
          this.cargarPedidosCerrados();
        },
      });
    }
  }

  togglePago(pedido: PedidoRead): void {
    this.pedidosService.togglePago(pedido.id).subscribe({
      next: () => {
        this.cargarPedidosPendientes();
        this.cargarPedidosCerrados();
      },
    });
  }

  toggleEntrega(pedido: PedidoRead): void {
    this.pedidosService.toggleEntrega(pedido.id).subscribe({
      next: () => {
        this.cargarPedidosPendientes();
        this.cargarPedidosCerrados();
      },
    });
  }

  limpiar(): void {
    this.pedidoEditandoId.set(null);
    this.clienteSeleccionado.set(null);
    this.terminoBusquedaCliente.set('');
    this.fechaEntregaSeleccionada.set(this.fechaMinima);
    this.errorBackend.set(null);
    this.productos.update((items) => items.map((i) => ({ ...i, maples: 0 })));
  }

  formatearFechaDisplay(fechaIso: string): string {
    if (!fechaIso) return '';
    const [anio, mes, dia] = fechaIso.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  formatearMoneda(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '0';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return '0';
    return Math.round(numero)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private generarProximosDias(): OpcionDiaEntrega[] {
    const lista: OpcionDiaEntrega[] = [];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const base = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = formatearFechaISO(d);
      const diaNom = dias[d.getDay()];
      const diaNum = String(d.getDate()).padStart(2, '0');
      const mesNum = String(d.getMonth() + 1).padStart(2, '0');
      lista.push({
        fechaIso: iso,
        etiqueta: `${diaNom} ${diaNum}/${mesNum}`,
      });
    }
    return lista;
  }

  private mostrarNotificacion(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(null), 3000);
  }
}
