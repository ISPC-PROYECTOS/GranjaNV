import { Component, OnInit, inject } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, CarruselComponent],
  templateUrl: './tips.html',
  styleUrls: ['./tips.css']
})
export class Tips implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/landing/recetas/';

  titulo = 'Tips';
  recetas: Receta[] = [];

  cuidados = [
    { id: 1, titulo: 'Higiene y manipulación', descripcion: 'Evitar golpes y mantener una buena higiene.' },
    { id: 2, titulo: 'Conservación en el hogar', descripcion: 'Mantener una temperatura ideal.' },
    { id: 3, titulo: 'Consejos de consumo', descripcion: 'Recomendaciones para disfrutar los huevos.' }
  ];

  ngOnInit(): void {
    this.http.get<Receta[]>(this.apiUrl).subscribe({
      next: (datos: Receta[]) => {
        this.recetas = datos;
      },
      error: (err: unknown) => {
        console.error('Error al cargar recetas:', err);
      }
    });
  }
}