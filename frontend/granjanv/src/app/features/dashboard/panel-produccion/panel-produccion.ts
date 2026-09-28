import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth-service';
import { GestionHuevos } from './gestion-huevos/gestion-huevos';
import { GestionGallinas } from './gestion-gallinas/gestion-gallinas';
import { DatosProduccion } from './datos-produccion/datos-produccion';

@Component({
  selector: 'app-panel-produccion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    GestionHuevos,
    GestionGallinas,
    DatosProduccion,
  ],
  templateUrl: './panel-produccion.html',
  styleUrl: './panel-produccion.css',
})
export class PanelProduccion {
  private readonly authService = inject(AuthService);

  readonly isAdmin = this.authService.isAdmin;
  readonly vistaMobile = signal<'formulario' | 'metricas'>('formulario');

  mostrarFormulario(): void {
    this.vistaMobile.set('formulario');
  }

  mostrarMetricas(): void {
    this.vistaMobile.set('metricas');
  }
}