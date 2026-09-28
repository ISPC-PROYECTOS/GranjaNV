import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-cliente-sugerencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./clientes-sugerencias.html`,
  styleUrl: './clientes-sugerencias.css' //
})
export class ClienteSugerenciasComponent {
  @Input({ required: true }) clientes: Cliente[] = [];
  @Output() seleccionar= new EventEmitter<Cliente>();

  onSeleccionar(cliente: Cliente, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.seleccionar.emit(cliente);
  }
}