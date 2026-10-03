import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Galpon } from '../../../../../core/models/produccion.model';
import { ProduccionService } from '../../../../../core/services/produccion.service';

@Component({
  selector: 'app-galpones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galpones.html',
  styleUrl: './galpones.css',
})
export class Galpones implements OnInit {
  private readonly produccionService = inject(ProduccionService);

  readonly galpones = this.produccionService.galpones;
  readonly cargando = this.produccionService.galponesCargando;
  readonly error = this.produccionService.errorGalpones;

  ngOnInit(): void {
    this.cargarGalpones();
  }

  cargarGalpones(): void {
    this.produccionService.cargarGalpones();
  }

  porcentajeOcupacion(galpon: Galpon): number {
    if (!galpon.capacidad_maxima) return 0;
    return Math.min(100, Math.round((galpon.cantidad_actual_gallinas / galpon.capacidad_maxima) * 100));
  }

  espaciosDisponibles(galpon: Galpon): number {
    return Math.max(0, galpon.capacidad_maxima - galpon.cantidad_actual_gallinas);
  }
}