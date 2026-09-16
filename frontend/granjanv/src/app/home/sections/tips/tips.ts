import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
export interface Receta {
  id?: number | string;
  titulo: string;
  descripcion: string;
  imagen?: string;
}

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tips.html',
  styleUrls: ['./tips.css']
})
export class Tips implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/landing/recetas/';
  
  titulo = 'Tips';

 // recetas = [
 //   { id: 1, titulo: 'Receta 1', descripcion: 'Descripción corta e ingredientes.' },
 //   { id: 2, titulo: 'Receta 2', descripcion: 'Descripción corta e ingredientes.' },
 //   { id: 3, titulo: 'Receta 3', descripcion: 'Descripción corta e ingredientes.' }
 // ];
  recetas: Receta[] = [];
  indiceActual= 0;

  cuidados = [
    { id: 1, titulo: 'Higiene y manipulación', descripcion: 'Evitar golpes y mantener una buena higiene.' },
    { id: 2, titulo: 'Conservación en el hogar', descripcion: 'Mantener una temperatura ideal.' },
    { id: 3, titulo: 'Consejos de consumo', descripcion: 'Recomendaciones para disfrutar los huevos.' }
  ];

  
  ngOnInit(): void {
    this.cargarRecetas();
  }

  cargarRecetas(): void {
    this.http.get<Receta[]>(this.apiUrl).subscribe({
      next: (datos) => {
        this.recetas = datos;
      },
      error: (err) => {
        console.error('Error al cargar recetas de MongoDB:', err);
      }
    });
  }
  get recetasVisibles(): Receta[] {
    return Array.from({ length: Math.min(3, this.recetas.length) }, (_, posicion) => {
      const indice = this.indiceActual + posicion;
      return this.recetas[indice];
    });
  }

  get indiceMaximo(): number {
    return Math.max(0, this.recetas.length - 3);
  }

  avanzarCarrusel(): void {
    if (this.indiceActual < this.indiceMaximo) {
      this.indiceActual++;
    }
  }

  retrocederCarrusel(): void {
    if (this.indiceActual > 0) {
      this.indiceActual--;
    }
  }
}
