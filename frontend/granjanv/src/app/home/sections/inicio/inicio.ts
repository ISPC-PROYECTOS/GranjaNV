import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {
  @Output() sectionClicked = new EventEmitter<string>();

  titulo = 'Bienvenidos a nuestra granja';
  descripcion = 'Producción de huevos frescos y naturales';

  navigateTo(sectionId: string) {
    this.sectionClicked.emit(sectionId);
  }
}
