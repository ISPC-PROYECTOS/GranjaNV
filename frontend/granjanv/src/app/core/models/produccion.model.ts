import { TipoHuevo } from './pedido.model';

// Extendemos TipoHuevo mixto
export type CategoriaProduccionHuevo = TipoHuevo | 'MIXTO';

export interface Galpon {
  id: number;
  numero_galpon: number;
  nombre: string;
  activo: boolean;
}

export interface ItemProduccionHuevo {
  tipo_huevo: CategoriaProduccionHuevo;
  cantidad_maples: number;
}

export interface RegistroProduccionPayload {
  galpon: number;
  fecha: string;
  items: ItemProduccionHuevo[];
  huevos_rotos: number; // Merma en unidades
  total_maples: number;
}

export type TipoMovimientoGallina = 'SALIDA' | 'INGRESO';

export type MotivoMovimientoGallina =
  | 'MUERTE'
  | 'VENTA'
  | 'REHABILITACION'
  | 'COMPRA'
  | 'RECUPERADA'
  | 'OTRO';

export interface MovimientoGallinaPayload {
  galpon: number;
  fecha: string;
  tipo_movimiento: TipoMovimientoGallina;
  motivo_movimiento: MotivoMovimientoGallina;
  cantidad_gallinas: number;
  descripcion_movimiento?: string;
}

export interface DatosProduccion {
  total_maples: number;
  total_gallinas: number;
  maples_color_2: number;
  maples_color_1: number;
  maples_blanco_2: number;
  maples_blanco_1: number;
  mixtos: number;
  mermas: number;
}