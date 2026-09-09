import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-buscador',
  imports: [],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css',
})
export class Buscador {
  readonly abiertoMobile = signal(false);
  readonly termino = signal('');

  readonly buscar = output<string>();

  toggleMobile(): void {
    this.abiertoMobile.update((valor) => !valor);
  }

  onBuscar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;

    this.termino.set(valor);
    this.buscar.emit(valor);
  }
}
