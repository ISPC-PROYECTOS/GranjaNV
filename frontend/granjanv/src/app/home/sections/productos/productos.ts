import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarruselComponent } from '../../../shared/carrusel/carrusel';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, CarruselComponent],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos {
  titulo = 'Nuestros productos';
  
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

 
}
