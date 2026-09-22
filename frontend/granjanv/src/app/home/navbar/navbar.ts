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
  menuAbierto = false;

  sections = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Sobre la granja', id: 'sobre-granja' },
    { name: 'Nuestros productos', id: 'productos' },
    { name: 'Nuestras gallinas', id: 'gallinas' },
    { name: 'Tips', id: 'tips' },
  ];

  navigateTo(sectionId: string) {
    this.sectionClicked.emit(sectionId);
    this.menuAbierto = false;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
