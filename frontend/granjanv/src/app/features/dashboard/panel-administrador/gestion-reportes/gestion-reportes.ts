import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-gestion-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './gestion-reportes.html',
  styleUrl: './gestion-reportes.css',
})
export class GestionReportes {
 
  readonly pestanias = [
    { etiqueta: 'REPORTES', ruta: 'reportes' },
    { etiqueta: 'MÉTRICAS', ruta: 'metricas' },
    { etiqueta: 'USUARIOS', ruta: 'usuarios' },
    { etiqueta: 'CLIENTES', ruta: 'clientes' },
    { etiqueta: 'GALPONES', ruta: 'galpones' },
  ];
}