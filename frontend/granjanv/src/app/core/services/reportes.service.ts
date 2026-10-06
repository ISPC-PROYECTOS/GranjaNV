import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReporteFinanzas, ReporteProduccion, ReporteCompleto } from '../models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/reportes/';

  obtenerReporteProduccion(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get<ReporteProduccion>(`${this.apiUrl}produccion/`, { params });
  }

  obtenerReporteFinanzas(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get<ReporteFinanzas>(`${this.apiUrl}finanzas/`, { params });
  }

  obtenerReporteCompleto(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get<ReporteCompleto>(`${this.apiUrl}completo/`, { params });
  }

  exportarReporte(
    tipo: 'finanzas' | 'produccion' | 'completo',
    formato: 'pdf' | 'excel',
    fechaDesde: string,
    fechaHasta: string,
  ) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get(`${this.apiUrl}${tipo}/${formato}/`, {
      params,
      responseType: 'blob',
    });
  }
}
