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
    { id: 1, nombre: 'Huevo 1', descripcion: 'Huevos frescos de nuestra granja' },
    { id: 2, nombre: 'Huevo 2', descripcion: 'Huevos frescos de nuestra granja' },
    { id: 3, nombre: 'Huevo 3', descripcion: 'Huevos frescos de nuestra granja' },
    { id: 4, nombre: 'Huevo 4', descripcion: 'Huevos frescos de nuestra granja' }
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
