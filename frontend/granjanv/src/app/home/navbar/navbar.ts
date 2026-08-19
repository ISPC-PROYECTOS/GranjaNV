import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  @Output() sectionClicked = new EventEmitter<string>();

  sections = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Sobre la Granja', id: 'sobre-granja' },
    { name: 'Nuestros Productos', id: 'productos' },
    { name: 'Nuestras Gallinas', id: 'gallinas' },
    { name: 'Tips', id: 'tips' },
    { name: 'Contacto', id: 'contactos' }
  ];

  navigateTo(sectionId: string) {
    this.sectionClicked.emit(sectionId);
  }
}
