import { Component, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { Inicio } from './sections/inicio/inicio';
import { SobreGranja } from './sections/sobre-granja/sobre-granja';
import { Productos } from './sections/productos/productos';
import { Gallinas } from './sections/gallinas/gallinas';
import { Tips } from './sections/tips/tips';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    Inicio,
    SobreGranja,
    Productos,
    Gallinas,
    Tips,
    Footer
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  @ViewChild('inicioSection') inicioSection!: ElementRef;
  @ViewChild('sobreGranjaSection') sobreGranjaSection!: ElementRef;
  @ViewChild('productosSection') productosSection!: ElementRef;
  @ViewChild('galinasSection') galinasSection!: ElementRef;
  @ViewChild('tipsSection') tipsSection!: ElementRef;

  currentSection = signal<string>('inicio');
  seccionesAbiertas: Record<string, boolean> = {
    inicio: true,
    'sobre-granja': false,
    productos: false,
    gallinas: false,
    tips: false
  };

  scrollToSection(sectionName: string) {
    this.currentSection.set(sectionName);
    this.seccionesAbiertas[sectionName] = true;
    
    const sectionMap: { [key: string]: ElementRef } = {
      'inicio': this.inicioSection,
      'sobre-granja': this.sobreGranjaSection,
      'productos': this.productosSection,
      'gallinas': this.galinasSection,
      'tips': this.tipsSection,
    };

    const section = sectionMap[sectionName];
    if (section) {
      section.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleSection(sectionName: string) {
    this.seccionesAbiertas[sectionName] = !this.seccionesAbiertas[sectionName];
  }

  isSectionOpen(sectionName: string) {
    return this.seccionesAbiertas[sectionName];
  }
}
