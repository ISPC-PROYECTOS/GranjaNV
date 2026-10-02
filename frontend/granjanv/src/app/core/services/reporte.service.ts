import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetricasComerciales {
  ventas_del_mes: number;
  porcentaje_cambio_ventas: number;
  produccion_diaria_promedio: number;
  ganancia_neta_mensual: number;
  evolucion_ventas_meses: Array<{ mes: string; total: number }>;
  tendencia_produccion_meses: Array<{ mes: string; promedio: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/reportes/metricas-comerciales/';

  getMetricasComerciales(): Observable<MetricasComerciales> {
    return this.http.get<MetricasComerciales>(this.apiUrl);
  }
}