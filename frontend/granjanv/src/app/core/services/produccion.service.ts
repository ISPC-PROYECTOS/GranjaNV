import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Galpon,
  RegistroProduccionPayload,
  MovimientoGallinaPayload,
  DatosProduccion,
} from '../models/produccion.model';

@Injectable({
  providedIn: 'root',
})
export class ProduccionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/produccion/';

  readonly galpones = signal<Galpon[]>([]);
  readonly galponesCargando = signal(false);
  readonly errorGalpones = signal(false);

  private readonly _datosProduccion = signal<DatosProduccion>({
    total_maples: 0,
    total_gallinas: 0,
    maples_color_2: 0,
    maples_color_1: 0,
    maples_blanco_2: 0,
    maples_blanco_1: 0,
    mixtos: 0,
    mermas: 0,
  });

  readonly datosProduccion = this._datosProduccion.asReadonly();

  constructor() {
    this.cargarGalpones();
    this.cargarMetricasProduccion();
  }

  cargarGalpones(): void {
    this.galponesCargando.set(true);
    this.errorGalpones.set(false);
    this.obtenerGalpones().subscribe({
      next: (data) => {
        this.galpones.set(data);
        this.galponesCargando.set(false);
      },
      error: (err) => {
        this.errorGalpones.set(true);
        this.galponesCargando.set(false);
        console.error('Error al cargar galpones:', err);
      },
    });
  }

  obtenerGalpones(soloActivos = false): Observable<Galpon[]> {
    let params = new HttpParams();
    if (soloActivos) {
      params = params.set('solo_activos', 'true');
    }
    return this.http.get<Galpon[]>(`${this.apiUrl}galpones/`, { params });
  }

  crearGalpon(payload: Partial<Galpon>): Observable<Galpon> {
    return this.http.post<Galpon>(`${this.apiUrl}galpones/`, payload);
  }

  actualizarGalpon(id: number, payload: Partial<Galpon>): Observable<Galpon> {
    return this.http.patch<Galpon>(`${this.apiUrl}galpones/${id}/`, payload);
  }

  cargarMetricasProduccion(): void {
    this.http.get<DatosProduccion>(`${this.apiUrl}metricas/`).subscribe({
      next: (data) => this._datosProduccion.set(data),
      error: (err) => console.error('Error al cargar métricas de producción:', err),
    });
  }

  registrarProduccion(payload: RegistroProduccionPayload): Observable<{ id: number; mensaje: string }> {
    return this.http.post<{ id: number; mensaje: string }>(`${this.apiUrl}huevos/`, payload).pipe(
      tap(() => {
        this.cargarMetricasProduccion();
      })
    );
  }

  registrarMovimientoGallinas(payload: MovimientoGallinaPayload): Observable<MovimientoGallinaPayload> {
    return this.http.post<MovimientoGallinaPayload>(`${this.apiUrl}movimiento-gallinas/`, payload).pipe(
      tap(() => {
        this.cargarGalpones();
        this.cargarMetricasProduccion();
      })
    );
  }
}