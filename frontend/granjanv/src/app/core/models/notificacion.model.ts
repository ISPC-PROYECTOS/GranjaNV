export type TipoNotificacion = 'PEDIDOS_DEL_DIA' | 'MOVIMIENTO_GALLINAS' | 'SISTEMA';

export interface Notificacion {
  readonly id: number;
  readonly tipo: TipoNotificacion;
  readonly tipo_display: string;
  readonly titulo: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly ruta: string;
  readonly fecha_referencia?: string | null;
  readonly datos_extra?: Record<string, unknown>;
  readonly creada_en: string;
}