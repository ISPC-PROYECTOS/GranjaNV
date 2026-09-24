import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarruselComponent } from '../../../../shared/carrusel/carrusel';
import { ProduccionService } from '../../../../core/services/produccion.service';

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
  private readonly produccionService = inject(ProduccionService);

  // Computado reactivo: al cambiar el estado en el servicio, las 4 tarjetas se actualizan al instante
  readonly tarjetasMetricas = computed<TarjetaMetricaProduccion[]>(() => {
    const datos = this.produccionService.datosProduccion();

    return [
      {
        arribaTitulo: 'TOTAL DE MAPLES',
        arribaValor: datos.total_maples,
        abajoTitulo: 'TOTAL GALLINAS',
        abajoValor: datos.total_gallinas,
      },
      {
        arribaTitulo: 'MAPLES COLOR 02',
        arribaValor: datos.maples_color_2,
        abajoTitulo: 'MAPLE COLOR 01',
        abajoValor: datos.maples_color_1,
      },
      {
        arribaTitulo: 'MAPLES BLANCO 02',
        arribaValor: datos.maples_blanco_2,
        abajoTitulo: 'MAPLE BLANCO 01',
        abajoValor: datos.maples_blanco_1,
      },
      {
        arribaTitulo: 'MIXTOS',
        arribaValor: datos.mixtos,
        abajoTitulo: 'MERMAS',
        abajoValor: datos.mermas,
      },
    ];
  });
}
