import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, tap } from 'rxjs';
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

  // Lista inicial de galpones del establecimiento
  readonly galpones = signal<Galpon[]>([
    { id: 1, numero_galpon: 1, nombre: 'Galpón 1', activo: true },
    { id: 2, numero_galpon: 2, nombre: 'Galpón 2', activo: false },
    { id: 3, numero_galpon: 3, nombre: 'Galpón 3', activo: false },
  ]);

  // Estado reactivo central de datos de producción mostrado en carrusel
  private readonly _datosProduccion = signal<DatosProduccion>({
    total_maples: 283,
    total_gallinas: 1379,
    maples_color_2: 140,
    maples_color_1: 85,
    maples_blanco_2: 35,
    maples_blanco_1: 23,
    mixtos: 15,
    mermas: 8,
  });

  readonly datosProduccion = this._datosProduccion.asReadonly();

  // Registra la recolección diaria de maples y mermas
  registrarProduccion(payload: RegistroProduccionPayload): Observable<RegistroProduccionPayload> {
    // Cuando el backend esté listo: return this.http.post<RegistroProduccionPayload>(`${this.apiUrl}huevos/`, payload);
    return of(payload).pipe(
      delay(300), // Simula latencia de red
      tap((data) => {
        this.actualizarDatosPorRecoleccion(data);
      })
    );
  }

  // Registra altas o bajas de aves 
  registrarMovimientoGallinas(payload: MovimientoGallinaPayload): Observable<MovimientoGallinaPayload> {
    // Cuando el backend esté listo: return this.http.post<MovimientoGallinaPayload>(`${this.apiUrl}movimiento-gallinas/`, payload);
    return of(payload).pipe(
      delay(300),
      tap((data) => {
        this.actualizarDatosPorMovimiento(data);
      })
    );
  }

  // Actualización reactiva interna al registrar huevos
  private actualizarDatosPorRecoleccion(payload: RegistroProduccionPayload): void {
    this._datosProduccion.update((prev) => {
      let extraC1 = 0;
      let extraC2 = 0;
      let extraB1 = 0;
      let extraB2 = 0;
      let extraMix = 0;

      for (const item of payload.items) {
        switch (item.tipo_huevo) {
          case 'COLOR_1':
            extraC1 += item.cantidad_maples;
            break;
          case 'COLOR_2':
            extraC2 += item.cantidad_maples;
            break;
          case 'BLANCO_1':
            extraB1 += item.cantidad_maples;
            break;
          case 'BLANCO_2':
            extraB2 += item.cantidad_maples;
            break;
          case 'MIXTO':
            extraMix += item.cantidad_maples;
            break;
        }
      }

      return {
        ...prev,
        total_maples: prev.total_maples + payload.total_maples,
        maples_color_1: prev.maples_color_1 + extraC1,
        maples_color_2: prev.maples_color_2 + extraC2,
        maples_blanco_1: prev.maples_blanco_1 + extraB1,
        maples_blanco_2: prev.maples_blanco_2 + extraB2,
        mixtos: prev.mixtos + extraMix,
        mermas: prev.mermas + payload.huevos_rotos,
      };
    });
  }

  // Actualización reactiva interna al registrar movimientos de aves
  private actualizarDatosPorMovimiento(payload: MovimientoGallinaPayload): void {
    this._datosProduccion.update((prev) => {
      const delta =
        payload.tipo_movimiento === 'INGRESO'
          ? payload.cantidad_gallinas
          : -payload.cantidad_gallinas;

      return {
        ...prev,
        total_gallinas: Math.max(0, prev.total_gallinas + delta),
      };
    });
  }
}