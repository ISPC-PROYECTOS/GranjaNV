import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  readonly texto = input<string>('Cargando datos...');
  readonly tamanio = input<'sm' | 'md' | 'lg'>('md');
  readonly color = input<'primario' | 'secundario' | 'blanco'>('primario');
  readonly alineacion = input<'centro' | 'inicio'>('centro');
  readonly overlay = input<boolean>(false);
}