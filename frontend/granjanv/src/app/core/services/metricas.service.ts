import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricasComerciales } from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class MetricasService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reportes/metricas-comerciales/';

  getMetricasComerciales(fechaDesde?: string, fechaHasta?: string): Observable<MetricasComerciales> {
    let params = new HttpParams();
    if (fechaDesde && fechaHasta) {
      params = params.set('fecha_desde', fechaDesde).set('fecha_hasta', fechaHasta);
    }
    return this.http.get<MetricasComerciales>(this.apiUrl, { params });
  }
}