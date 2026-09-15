import { Cliente } from './cliente.model';

export type TipoHuevo = 'BLANCO_1' | 'BLANCO_2' | 'COLOR_1' | 'COLOR_2';

export interface MetricasDashboardResponse {
  pedidos_pendientes: number;
  total_ventas_cobradas: string;
}

export interface ItemPedidoRead {
  id: number;
  tipo_huevo: TipoHuevo;
  tipo_huevo_display: string;
  cantidad_unidades: number;
  cantidad_maples: number;
  precio_unitario: string;
  subtotal: string;
}

export interface ItemPedidoWrite {
  tipo_huevo: TipoHuevo;
  cantidad_maples: number;
}

export interface PedidoRead {
  id: number;
  cliente: Cliente;
  fecha_entrega: string;
  dia_semana_entrega: string;
  estado_pago: boolean;
  estado_entrega: boolean;
  total: string;
  observaciones: string;
  items: ItemPedidoRead[];
  resumen_productos: string;
  creado_en: string;
  actualizado_en: string;
}

export interface PedidoWritePayload {
  cliente: number;
  fecha_entrega: string;
  estado_pago?: boolean;
  estado_entrega?: boolean;
  observaciones?: string;
  items: ItemPedidoWrite[];
}

export interface ProductoCatalogo {
  codigo: TipoHuevo;
  nombre: string;
  precioMaple: number;
  maples: number;
}

export interface OpcionDiaEntrega {
  fechaIso: string;
  etiqueta: string;
}

export interface FiltroPedidos {
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pendientes?: boolean;
  cerrados?: boolean;
}