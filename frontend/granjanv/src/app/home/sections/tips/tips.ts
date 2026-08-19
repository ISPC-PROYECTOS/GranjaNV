import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tips.html',
  styleUrls: ['./tips.css']
})
export class Tips implements OnInit {
  titulo = 'Tips';

  recetas = [
    { id: 1, titulo: 'Receta 1', descripcion: 'Descripción corta e ingredientes.' },
    { id: 2, titulo: 'Receta 2', descripcion: 'Descripción corta e ingredientes.' },
    { id: 3, titulo: 'Receta 3', descripcion: 'Descripción corta e ingredientes.' }
  ];

  cuidados = [
    { id: 1, titulo: 'Higiene y manipulación', descripcion: 'Evitar golpes y mantener una buena higiene.' },
    { id: 2, titulo: 'Conservación en el hogar', descripcion: 'Mantener una temperatura ideal.' },
    { id: 3, titulo: 'Consejos de consumo', descripcion: 'Recomendaciones para disfrutar los huevos.' }
  ];

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend
  }
}
