import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Gasto } from '../models/gasto.model';

@Injectable({
  providedIn: 'root',
})
export class Gastos {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/compras/gastos/';

  obtenerGastos(search: string= '' ) {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<Gasto[]>(this.apiUrl, { params });
    
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

  obtenerTotalGastos() {
    return this.http.get<{ total: string }>(`${this.apiUrl}total/`);
  }
}