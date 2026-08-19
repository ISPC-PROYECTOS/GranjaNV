import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallinas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallinas.html',
  styleUrls: ['./gallinas.css']
})
export class Gallinas implements OnInit {
  titulo = 'Nuestras Gallinas';
  
  gallinas = [
    { id: 1, nombre: 'Alimentos', descripcion: 'Explicar que reciben granos naturales y agua fresca.' },
    { id: 2, nombre: 'Espacios Adecuados', descripcion: 'Destacar que cuentan con gallineros amplios y ventilados.' },
    { id: 3, nombre: 'Bienestar y Salud', descripcion: 'Revisiones veterinarias periódicas.' },
    { id: 4, nombre: 'Compromiso con el cuidado', descripcion: 'Frase tipo: “Nuestras gallinas son tratadas con respeto y dedicación, porque su bienestar es la base de la calidad de nuestros huevos.”' },
    { id: 5, nombre: 'Condiciones ambientales', descripcion: 'Protección contra depredadores y clima extremo.' }
  ];

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend
  }
}
