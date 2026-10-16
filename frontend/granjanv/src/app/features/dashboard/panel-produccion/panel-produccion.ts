import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth-service';
import { ProduccionService } from '../../../core/services/produccion.service';
import { GestionHuevos } from './gestion-huevos/gestion-huevos';
import { GestionGallinas } from './gestion-gallinas/gestion-gallinas';
import { DatosProduccion } from './datos-produccion/datos-produccion';

@Component({
  selector: 'app-panel-produccion',
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
export class PanelProduccion implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly produccionService = inject(ProduccionService);

  readonly isAdmin = this.authService.isAdmin;
  readonly vistaMobile = signal<'formulario' | 'metricas'>('formulario');

  ngOnInit(): void {
    // Sincroniza métricas y galpones frescos cada vez que se entra a la vista
    this.produccionService.cargarMetricasProduccion();
    this.produccionService.cargarGalpones();
  }

  mostrarFormulario(): void {
    this.vistaMobile.set('formulario');
  }

  mostrarMetricas(): void {
    this.vistaMobile.set('metricas');
  }
}