import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos {
  titulo = 'Nuestros Productos';
  indiceActual = 0;
  
  productos = [
    {
      id: 1,
      nombre: 'Huevo mediano de color',
      descripcion: 'Huevo de tamaño mediano, con cáscara de color natural.',
      imagen: '/ImagenesHome/huevos-1.jpeg'
    },
    {
      id: 2,
      nombre: 'Huevo grande de color',
      descripcion: 'Huevo grande, con cáscara de color natural.',
      imagen: '/ImagenesHome/huevos-2.jpeg'
    },
    {
      id: 3,
      nombre: 'Huevo blanco mediano',
      descripcion: 'Huevo blanco de tamaño mediano y calidad natural.',
      imagen: '/ImagenesHome/huevos-3.jpg'
    },
    {
      id: 4,
      nombre: 'Huevo blanco grande',
      descripcion: 'Huevo blanco de tamaño grande y calidad natural.',
      imagen: '/ImagenesHome/huevo-4.jpg'
    }
  ];

  get productosVisibles() {
    return Array.from({ length: Math.min(3, this.productos.length) }, (_, posicion) => {
      const indice = this.indiceActual + posicion;
      return this.productos[indice];
    });
  }

  get indiceMaximo() {
    return Math.max(0, this.productos.length - 3);
  }

  avanzarCarrusel() {
    if (this.indiceActual < this.indiceMaximo) {
      this.indiceActual++;
    }
  }

  retrocederCarrusel() {
    if (this.indiceActual > 0) {
      this.indiceActual--;
    }
  }
}
