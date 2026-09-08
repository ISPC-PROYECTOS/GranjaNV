import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FiltroPedidos,
  MetricasDashboardResponse,
  PedidoRead,
  PedidoWritePayload,
} from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/pedidos/';

  private armarParams(filtros?: FiltroPedidos): HttpParams {
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
    if (filtros.pendientes !== undefined) {
      params = params.set('pendientes', filtros.pendientes.toString());
    }
    if (filtros.cerrados !== undefined) {
      params = params.set('cerrados', filtros.cerrados.toString());
    }
    return params;
  }

  obtenerMetricas(): Observable<MetricasDashboardResponse> {
    return this.http.get<MetricasDashboardResponse>(`${this.apiUrl}metricas/`);
  }

  obtenerPedidos(filtros?: FiltroPedidos): Observable<PedidoRead[]> {
    const params = this.armarParams(filtros);
    return this.http.get<PedidoRead[]>(this.apiUrl, { params });
  }

  crearPedido(payload: PedidoWritePayload): Observable<PedidoRead> {
    return this.http.post<PedidoRead>(this.apiUrl, payload);
  }

  actualizarPedido(id: number, payload: PedidoWritePayload): Observable<PedidoRead> {
    return this.http.put<PedidoRead>(`${this.apiUrl}${id}/`, payload);
  }

  eliminarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  togglePago(id: number): Observable<PedidoRead> {
    return this.http.patch<PedidoRead>(`${this.apiUrl}${id}/toggle-pago/`, {});
  }

  toggleEntrega(id: number): Observable<PedidoRead> {
    return this.http.patch<PedidoRead>(`${this.apiUrl}${id}/toggle-entrega/`, {});
  }
}