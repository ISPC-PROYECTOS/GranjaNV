import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricasComerciales } from '../models/reporte.model';

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