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
    {
      id: 1,
      titulo: 'Higiene y manipulación',
      descripcion: 'Lavá tus manos antes de manipularlos y evitá golpes o cambios bruscos que puedan dañar la cáscara.',
      imagen: '/ImagenesHome/Higiene%20y%20manipulacion.jpg'
    },
    {
      id: 2,
      titulo: 'Conservación en el hogar',
      descripcion: 'Guardalos en un lugar fresco y estable, preferentemente en su envase y alejados de alimentos con olores fuertes.',
      imagen: '/ImagenesHome/Conservacion%20en%20el%20hogar.jpg'
    },
    {
      id: 3,
      titulo: 'Consejos de consumo',
      descripcion: 'Antes de consumirlos, verificá que la cáscara esté limpia y sin grietas, y cocinalos según la preparación elegida.',
      imagen: '/ImagenesHome/Consejos%20de%20consumo.jpg'
    }
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