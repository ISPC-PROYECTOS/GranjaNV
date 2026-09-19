import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  @Output() sectionClicked = new EventEmitter<string>();

  seccionesAbiertas: Record<string, boolean> = {};

  grupoEmpresa = 'Granja NV';
  descripcion = 'Producción de huevos frescos y naturales';
  
  contacto = {
    telefono: '+54 9 385 516-9337',
    email: 'info@granjaNV.com',
    ubicacion: 'Forres, Santiago del Estero, Argentina'
  };
  
  horarios = {
    lunes_viernes: '08:00 - 18:00',
    sabados: '09:00 - 13:00',
    domingos: 'Cerrado'
  };
  
  redesSociales = [
      {
    nombre: 'TikTok',
    icono: '/ImagenesHome/tiktok.svg',
    url: 'https://www.tiktok.com/@granja_nv'
  },
  {
    nombre: 'Instagram',
    icono: '/ImagenesHome/instagram.svg',
    url: 'https://www.instagram.com/granja_nv/'
  }
  ];
  
  anyoActual = new Date().getFullYear();

  isSectionOpen(sectionName: string): boolean {
    return this.seccionesAbiertas[sectionName] ?? false;
  }

  toggleSection(sectionName: string): void {
    this.seccionesAbiertas[sectionName] = !this.isSectionOpen(sectionName);
  }

  navigateTo(sectionId: string): void {
    this.sectionClicked.emit(sectionId);
  }
}
