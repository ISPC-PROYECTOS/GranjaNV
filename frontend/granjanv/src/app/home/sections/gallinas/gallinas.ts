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
  indiceAbierto: number | null = null;
  
  gallinas = [
    { id: 1, nombre: 'Alimentos', descripcion: 'Reciben granos naturales y agua fresca.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 2, nombre: 'Espacios Adecuados', descripcion: 'Cuentan con gallineros amplios y ventilados.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 3, nombre: 'Bienestar y Salud', descripcion: 'Reciben revisiones veterinarias periódicas.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 4, nombre: 'Compromiso con el cuidado', descripcion: 'Son tratadas con respeto y dedicación.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 5, nombre: 'Condiciones ambientales', descripcion: 'Están protegidas contra el clima extremo.', imagen: '/ImagenesHome/gallinas.jpg' }
  ];

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend
  }

  toggleDescripcion(indice: number) {
    this.indiceAbierto = this.indiceAbierto === indice ? null : indice;
  }
}
