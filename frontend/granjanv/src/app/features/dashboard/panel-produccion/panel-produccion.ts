import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionHuevos } from './gestion-huevos/gestion-huevos';
import { GestionGallinas } from './gestion-gallinas/gestion-gallinas';
import { DatosProduccion } from './datos-produccion/datos-produccion';

@Component({
  selector: 'app-panel-produccion',
  standalone: true,
  imports: [
    CommonModule,
    GestionHuevos,
    GestionGallinas,
    DatosProduccion
  ],
  templateUrl: './panel-produccion.html',
  styleUrl: './panel-produccion.css',
})
export class PanelProduccion {
  readonly vistaMobile = signal<'formulario' | 'metricas'>('formulario');

  mostrarFormulario(): void {
    this.vistaMobile.set('formulario');
  }

  mostrarMetricas(): void {
    this.vistaMobile.set('metricas');
  }
}