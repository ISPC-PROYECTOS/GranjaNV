import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
// --- INICIO ZONA DE PRUEBA (BORRAR LUEGO) ---
import { CrearClienteComponent } from './shared/clientes/crear-cliente';
// --- FIN ZONA DE PRUEBA ---
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent,
    // --- INICIO ZONA DE PRUEBA (BORRAR LUEGO) ---
    CrearClienteComponent
    // --- FIN ZONA DE PRUEBA ---
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('granjanv');

  // --- INICIO ZONA DE PRUEBA (BORRAR LUEGO) ---
  mostrarTestForm = true;

  capturarNuevoCliente(datosCliente: any): void {
    console.log('Evento clienteCreado recibido:', datosCliente);
    alert(`¡Cliente ${datosCliente.nombre} guardado! (Revisá la consola)`);
  }

  ocultarFormulario(): void {
    console.log('Evento cerrar recibido');
    this.mostrarTestForm = false;
  }
  // --- FIN ZONA DE PRUEBA ---
}
