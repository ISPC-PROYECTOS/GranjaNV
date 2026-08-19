import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  titulo = 'Nuestros Productos';
  
  productos = [
    { id: 1, nombre: 'Huevo 1', descripcion: 'Huevos frescos de nuestra granja' },
    { id: 2, nombre: 'Huevo 2', descripcion: 'Huevos frescos de nuestra granja' },
    { id: 3, nombre: 'Huevo 3', descripcion: 'Huevos frescos de nuestra granja' }
  ];

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend para obtener productos dinámicos
  }
}
