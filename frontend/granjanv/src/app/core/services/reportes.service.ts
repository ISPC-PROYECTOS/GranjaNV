import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface ReporteFinanzas {
  ingresos: string;
  egresos: string;
  balance_neto: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/reportes/';

  obtenerReporteFinanzas(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get<ReporteFinanzas>(`${this.apiUrl}finanzas/`, { params });
  }

  exportarFinanzasPdf(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get(`${this.apiUrl}finanzas/pdf/`, {
      params,
      responseType: 'blob',
    });
  }

  exportarFinanzasExcel(fechaDesde: string, fechaHasta: string) {
    const params = new HttpParams().set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);

    return this.http.get(`${this.apiUrl}finanzas/excel/`, {
      params,
      responseType: 'blob',
    });
  }
}
