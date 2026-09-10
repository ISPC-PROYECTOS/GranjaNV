import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GestionHuevos } from './gestion-huevos/gestion-huevos';
import { RegistroIncidentes } from './registro-incidentes/registro-incidentes';
import { GestionGallinas } from './gestion-gallinas/gestion-gallinas';

@Component({
  selector: 'app-panel-produccion',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    GestionHuevos, 
    RegistroIncidentes, 
    GestionGallinas
  ],
  templateUrl: './panel-produccion.html',
  styleUrl: './panel-produccion.css',
})
export class PanelProduccion {}