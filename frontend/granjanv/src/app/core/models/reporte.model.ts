export interface MetricasComerciales {
  ventas_del_mes: number;
  porcentaje_cambio_ventas: number;
  produccion_diaria_promedio: number;
  porcentaje_postura_mes: number;
  ganancia_neta_mensual: number;
  evolucion_ventas_meses: Array<{ mes: string; total: number }>;
  tendencia_produccion_meses: Array<{ mes: string; promedio: number}>;
}