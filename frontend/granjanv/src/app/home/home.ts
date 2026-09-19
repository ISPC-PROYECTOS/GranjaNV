import { Component, ElementRef, viewChild, signal } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Inicio } from './sections/inicio/inicio';
import { SobreGranja } from './sections/sobre-granja/sobre-granja';
import { Productos } from './sections/productos/productos';
import { Gallinas } from './sections/gallinas/gallinas';
import { Tips } from './sections/tips/tips';
import { Footer } from './footer/footer';

export type SectionId = 'inicio' | 'sobre-granja' | 'productos' | 'gallinas' | 'tips';

@Component({
  selector: 'app-home',
  imports: [
    Navbar,
    Inicio,
    SobreGranja,
    Productos,
    Gallinas,
    Tips,
    Footer
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly inicioSection = viewChild<ElementRef<HTMLElement>>('inicioSection');
  readonly sobreGranjaSection = viewChild<ElementRef<HTMLElement>>('sobreGranjaSection');
  readonly productosSection = viewChild<ElementRef<HTMLElement>>('productosSection');
  readonly gallinasSection = viewChild<ElementRef<HTMLElement>>('gallinasSection');
  readonly tipsSection = viewChild<ElementRef<HTMLElement>>('tipsSection');

  readonly currentSection = signal<SectionId>('inicio');

  readonly seccionesAbiertas = signal<Record<SectionId, boolean>>({
    inicio: true,
    'sobre-granja': false,
    productos: false,
    gallinas: false,
    tips: false
  });

  isSectionOpen(sectionName: SectionId): boolean {
    return this.seccionesAbiertas()[sectionName];
  }

  toggleSection(sectionName: SectionId): void {
    this.seccionesAbiertas.update((estados) => ({
      ...estados,
      [sectionName]: !estados[sectionName]
    }));
  }

  scrollToSection(sectionName: string): void {
    const validId = sectionName as SectionId;
    this.currentSection.set(validId);

    // En móvil, asegura que la sección se expanda antes de hacer scroll
    this.seccionesAbiertas.update((estados) => ({
      ...estados,
      [validId]: true
    }));

    const sectionMap: Record<SectionId, () => ElementRef<HTMLElement> | undefined> = {
      inicio: () => this.inicioSection(),
      'sobre-granja': () => this.sobreGranjaSection(),
      productos: () => this.productosSection(),
      gallinas: () => this.gallinasSection(),
      tips: () => this.tipsSection()
    };

    const targetRef = sectionMap[validId]?.();
    if (targetRef?.nativeElement) {
      targetRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}