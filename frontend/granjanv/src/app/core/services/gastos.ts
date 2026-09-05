import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Gasto } from '../models/gasto.model';

export interface FiltroGastos {
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;}

@Injectable({
  providedIn: 'root',
})
export class Gastos {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/compras/gastos/';

  private armarParams(filtros?: FiltroGastos): HttpParams {
    let params = new HttpParams();
    if (!filtros) return params;

    if (filtros.search && filtros.search.trim()) {
      params = params.set('search', filtros.search.trim());
    }
    if (filtros.fechaDesde) {
      params = params.set('fecha_desde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params = params.set('fecha_hasta', filtros.fechaHasta);
    }
    return params;
  }
  obtenerGastos(filtros?: FiltroGastos) {
    const params = this.armarParams(filtros);
    return this.http.get<Gasto[]>(this.apiUrl, { params });
  }

  obtenerTotalGastos(filtros?: FiltroGastos) {
    const params = this.armarParams(filtros);
    return this.http.get<{ total: string }>(`${this.apiUrl}total/`, { params });
  }

  crearGasto(gasto: Partial<Gasto>) {
    return this.http.post<Gasto>(this.apiUrl, gasto);
  }

  eliminarGasto(id: number) {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  actualizarGasto(id: number, gasto: Partial<Gasto>) {
    return this.http.patch<Gasto>(`${this.apiUrl}${id}/`, gasto);
  }
}
