import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CarruselComponent } from '../../../shared/carrusel/carrusel';

export interface Receta {
  id?: number | string;
  titulo: string;
  descripcion: string;
  imagen?: string;
}

@Component({
  selector: 'app-tips',
  imports: [CommonModule, CarruselComponent],
  templateUrl: './tips.html',
  styleUrls: ['./tips.css']
})
export class Tips implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/landing/recetas/';

  readonly titulo = 'Tips';
  readonly recetas = signal<Receta[]>([]);
  readonly cargando = signal<boolean>(true);
  readonly errorCarga = signal<boolean>(false);

  readonly cuidados = [
    { id: 1, titulo: 'Higiene y manipulación', descripcion: 'Evitar golpes y mantener una buena higiene.' },
    { id: 2, titulo: 'Conservación en el hogar', descripcion: 'Mantener una temperatura ideal.' },
    { id: 3, titulo: 'Consejos de consumo', descripcion: 'Recomendaciones para disfrutar los huevos.' }
  ];

  ngOnInit(): void {
    this.http.get<Receta[]>(this.apiUrl).subscribe({
      next: (datos: Receta[]) => {
        this.recetas.set(datos);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        console.error('Error al cargar recetas:', err);
        this.errorCarga.set(true);
        this.cargando.set(false);
      }
    });
  }
}