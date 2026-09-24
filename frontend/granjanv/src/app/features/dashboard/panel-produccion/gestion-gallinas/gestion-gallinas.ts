import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-gallinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-gallinas.html',
  styleUrl: './gestion-gallinas.css',
})
export class GestionGallinas {
  readonly desplegado = signal<boolean>(false);
  readonly tipoMovimiento = signal<'SALIDA' | 'INGRESO'>('SALIDA');

  toggleDesplegable(): void {
    this.desplegado.update((v) => !v);
  }

  cambiarTipo(tipo: 'SALIDA' | 'INGRESO'): void {
    this.tipoMovimiento.set(tipo);
  }
}
