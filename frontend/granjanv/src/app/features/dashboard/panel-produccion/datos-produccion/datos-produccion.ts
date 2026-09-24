import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarruselComponent } from '../../../../shared/carrusel/carrusel';

export interface TarjetaMetricaProduccion {
  arribaTitulo: string;
  arribaValor: string | number;
  abajoTitulo: string;
  abajoValor: string | number;
}

@Component({
  selector: 'app-datos-produccion',
  standalone: true,
  imports: [CommonModule, CarruselComponent],
  templateUrl: './datos-produccion.html',
  styleUrl: './datos-produccion.css',
})
export class DatosProduccion {
  readonly tarjetasMetricas = signal<TarjetaMetricaProduccion[]>([
    {
      arribaTitulo: 'TOTAL DE MAPLES',
      arribaValor: 283,
      abajoTitulo: 'TOTAL GALLINAS',
      abajoValor: 1379,
    },
    {
      arribaTitulo: 'MAPLES COLOR 02',
      arribaValor: 140,
      abajoTitulo: 'MAPLE COLOR 01',
      abajoValor: 85,
    },
    {
      arribaTitulo: 'MAPLES BLANCO 02',
      arribaValor: 35,
      abajoTitulo: 'MAPLE BLANCO 01',
      abajoValor: 23,
    },
    {
      arribaTitulo: 'MIXTOS',
      arribaValor: 15,
      abajoTitulo: 'MERMAS',
      abajoValor: 8,
    },
  ]);
}
