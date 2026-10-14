import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../../../core/models/cliente.model';
import { ClientesService } from '../../../../../core/services/clientes.service';
import { CrearClienteComponent } from '../../../../../shared/clientes/crear-cliente';
import { Buscador } from '../../../../../shared/buscador/buscador';
import { Spinner } from '../../../../../shared/spinner/spinner';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, CrearClienteComponent, Buscador, Spinner],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  private readonly clientesService = inject(ClientesService);

  readonly clientes = signal<Cliente[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly modalAbierto = signal(false);
  readonly clienteEdicion = signal<Cliente | null>(null);
  readonly busquedaCliente = signal('');
  readonly filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');
  readonly actualizandoEstadoId = signal<number | null>(null);
  readonly clientesVisibles = computed(() => {
    const filtro = this.filtroEstado();
    const normalizar = (texto: string) => texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const terminos = normalizar(this.busquedaCliente()).trim().split(/\s+/).filter(Boolean);
    return this.clientes().filter((cliente) => {
      const coincideEstado = filtro === 'todos'
        || (filtro === 'activos' && cliente.activo)
        || (filtro === 'inactivos' && !cliente.activo);
      if (!coincideEstado) return false;
      if (!terminos.length) return true;

      const nombreCompleto = normalizar(`${cliente.nombre} ${cliente.apellido ?? ''}`);
      return terminos.every((termino) => nombreCompleto.includes(termino));
    });
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.clientesService.obtenerClientes(undefined, true).subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de clientes.');
        this.cargando.set(false);
      },
    });
  }

  abrirAlta(): void {
    this.error.set(null);
    this.clienteEdicion.set(null);
    this.modalAbierto.set(true);
  }

  abrirEdicion(cliente: Cliente): void {
    this.error.set(null);
    this.clienteEdicion.set(cliente);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.clienteEdicion.set(null);
  }

  actualizarLista(cliente: Cliente): void {
    this.clientes.update((clientes) => {
      const indice = clientes.findIndex((item) => item.id === cliente.id);
      if (indice < 0) return [...clientes, cliente];
      return clientes.map((item, posicion) => posicion === indice ? cliente : item);
    });
  }

  cambiarEstado(cliente: Cliente): void {
    if (cliente.id === undefined || this.actualizandoEstadoId() !== null) return;

    this.actualizandoEstadoId.set(cliente.id);
    this.error.set(null);
    this.clientesService.actualizarCliente(cliente.id, { activo: !cliente.activo }).subscribe({
      next: (actualizado) => {
        this.actualizarLista(actualizado);
        this.actualizandoEstadoId.set(null);
      },
      error: () => {
        this.error.set(`No se pudo ${cliente.activo ? 'desactivar' : 'activar'} el cliente.`);
        this.actualizandoEstadoId.set(null);
      },
    });
  }

  iniciales(cliente: Cliente): string {
    const nombre = cliente.nombre.trim().charAt(0);
    const apellido = cliente.apellido?.trim().charAt(0) ?? '';
    return `${nombre}${apellido}`.toUpperCase();
  }
}