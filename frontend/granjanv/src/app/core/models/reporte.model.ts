export interface ReporteProduccion {
  total_maples: number;
  mermas: number;
  produccion_por_tipo: Record<string, number>;
}

export interface ReporteFinanzas {
  ingresos: string;
  egresos: string;
  balance_neto: string;
}

export interface ReporteCompleto {
  finanzas: ReporteFinanzas;
  produccion: ReporteProduccion;
}