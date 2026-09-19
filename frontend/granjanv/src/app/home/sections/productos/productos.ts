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
      descripcion: 'Tamaño práctico para el consumo diario, con cáscara de color natural y sabor suave.',
      imagen: '/ImagenesHome/huevos-1.jpeg'
    },
    {
      id: 2,
      nombre: 'Huevo grande de color',
      descripcion: 'Una opción abundante para tortillas, revueltos y preparaciones que necesitan más cuerpo.',
      imagen: '/ImagenesHome/huevos-2.jpeg'
    },
    {
      id: 3,
      nombre: 'Huevo blanco mediano',
      descripcion: 'Huevo blanco mediano, ideal para desayunos, ensaladas y recetas de todos los días.',
      imagen: '/ImagenesHome/huevos-3.jpg'
    },
    {
      id: 4,
      nombre: 'Huevo blanco grande',
      descripcion: 'Su tamaño grande aporta una porción generosa para pastelería, omelettes y comidas familiares.',
      imagen: '/ImagenesHome/huevo-4.jpg'
    }
  ];

 
}
