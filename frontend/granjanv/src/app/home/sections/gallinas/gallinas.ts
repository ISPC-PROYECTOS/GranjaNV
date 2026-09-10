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
    { id: 1, nombre: 'Alimentos', descripcion: 'Nuestras gallinas reciben una dieta balanceada a base de granos naturales y agua fresca, diseñada para garantizar su bienestar y la producción de huevos nutritivos. La alimentación controlada asegura calidad constante y refuerza nuestro compromiso con prácticas responsables.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 2, nombre: 'Espacios Adecuados', descripcion: 'Las aves cuentan con gallineros amplios, ventilados y acceso a áreas al aire libre. Estos espacios favorecen su movilidad y comportamiento natural, creando un entorno saludable que se refleja en la frescura y sabor de nuestros productos.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 3, nombre: 'Bienestar y Salud', descripcion: 'El bienestar animal es prioridad: realizamos controles veterinarios periódicos, vacunación preventiva y mantenemos una higiene rigurosa en los gallineros. Así aseguramos que cada gallina viva en condiciones óptimas de salud y cuidado.', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 4, nombre: 'Compromiso con el cuidado', descripcion: 'Protegemos a nuestras gallinas de depredadores y condiciones climáticas extremas mediante instalaciones seguras y un control adecuado de temperatura y humedad. Este entorno estable contribuye a su tranquilidad y a la calidad de los huevos que producimos .', imagen: '/ImagenesHome/gallinas.jpg' },
    { id: 5, nombre: 'Condiciones ambientales', descripcion: 'En nuestra granja cuidamos cada detalle del entorno en el que viven las gallinas. Controlamos la temperatura y la humedad de los espacios para que se mantengan estables durante todo el año, evitando el estrés por calor o frío.', imagen: '/ImagenesHome/gallinas.jpg' }
  ];

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend
  }

  toggleDescripcion(indice: number) {
    this.indiceAbierto = this.indiceAbierto === indice ? null : indice;
  }
}
