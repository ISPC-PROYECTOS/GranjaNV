import {
  Component,
  Input,
  TemplateRef,
  ContentChild,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css']
})
export class CarruselComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() visibleDesktop: number = 3;
  @Input() visibleMobile: number = 1;
  @Input() breakpointMobile: number = 768;

  // Permite proyectar la plantilla de la tarjeta desde el componente padre
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;

  readonly indiceActual = signal(0);
  readonly esMobile = signal(false);

  private resizeListener = () => {
    this.esMobile.set(window.innerWidth <= this.breakpointMobile);
  };

  ngOnInit(): void {
    this.resizeListener();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  get cantidadVisible(): number {
    const limite = this.esMobile() ? this.visibleMobile : this.visibleDesktop;
    return Math.min(limite, this.items.length);
  }

  get itemsVisibles(): any[] {
    if (!this.items || this.items.length === 0) return [];
    return Array.from({ length: this.cantidadVisible }, (_, posicion) => {
      const indice = (this.indiceActual() + posicion) % this.items.length;
      return this.items[indice];
    });
  }

  avanzar(): void {
    if (!this.items?.length) return;
    this.indiceActual.update((idx) => (idx + 1) % this.items.length);
  }

  retroceder(): void {
    if (!this.items?.length) return;
    this.indiceActual.update((idx) => (idx - 1 + this.items.length) % this.items.length);
  }
}