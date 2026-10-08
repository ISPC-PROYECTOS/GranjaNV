import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/notificaciones/';

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal<boolean>(false);

  readonly noLeidasCount = computed<number>(() =>
    this.notificaciones().filter((n) => !n.leida).length
  );

  cargarNotificaciones(): void {
    this.cargando.set(true);
    this.http.get<Notificacion[]>(this.apiUrl).subscribe({
      next: (items) => {
        this.notificaciones.set(items);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        console.error('Error al obtener notificaciones:', err);
        this.cargando.set(false);
      }
    });
  }

  marcarComoLeida(id: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.apiUrl}${id}/marcar-leida/`, {}).pipe(
      tap((actualizada) => {
        this.notificaciones.update((lista) =>
          lista.map((n) => (n.id === id ? actualizada : n))
        );
      })
    );
  }

  marcarTodasComoLeidas(): Observable<{ actualizadas: number }> {
    return this.http.patch<{ actualizadas: number }>(`${this.apiUrl}marcar-todas-leidas/`, {}).pipe(
      tap(() => {
        this.notificaciones.update((lista) =>
          lista.map((n) => ({ ...n, leida: true }))
        );
      })
    );
  }

  eliminarNotificacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => {
        this.notificaciones.update((lista) => lista.filter((n) => n.id !== id));
      })
    );
  }
}