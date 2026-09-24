import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProduccionService } from '../../../../core/services/produccion.service';
import {
  CategoriaProduccionHuevo,
  ItemProduccionHuevo,
  RegistroProduccionPayload,
} from '../../../../core/models/produccion.model';
import { formatearFechaISO } from '../../../../core/utils/date.utils';

interface FilaProductoMaple {
  codigo: CategoriaProduccionHuevo;
  etiqueta: string;
  cantidad: number;
}

@Component({
  selector: 'app-gestion-huevos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-huevos.html',
  styleUrl: './gestion-huevos.css',
})
export class GestionHuevos {
  private readonly produccionService = inject(ProduccionService);

  // Galpones disponibles traídos del servicio
  readonly galpones = this.produccionService.galpones;

  // Galpón 1 seleccionado por defecto
  readonly galponSeleccionado = signal<number>(1);

  // Variedades de maples
  readonly itemsMaples = signal<FilaProductoMaple[]>([
    { codigo: 'COLOR_1', etiqueta: 'Color N.° 1', cantidad: 0 },
    { codigo: 'COLOR_2', etiqueta: 'Color N.° 2', cantidad: 0 },
    { codigo: 'BLANCO_1', etiqueta: 'Blanco N.° 1', cantidad: 0 },
    { codigo: 'BLANCO_2', etiqueta: 'Blanco N.° 2', cantidad: 0 },
    { codigo: 'MIXTO', etiqueta: 'Mixto', cantidad: 0 },
  ]);

  // Merma de unidades
  readonly huevosRotos = signal<number>(0);

  // Cálculo reactivo del total de maples sumando todas las categorías
  readonly totalMaples = computed(() =>
    this.itemsMaples().reduce((acc, item) => acc + item.cantidad, 0)
  );

  // Control de estados de interfaz
  readonly isGuardando = signal<boolean>(false);
  readonly mostrarConfirmacion = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly errorMensaje = signal<string | null>(null);

  // Payload preparado para ser confirmado
  readonly payloadPendiente = signal<RegistroProduccionPayload | null>(null);

  incrementar(codigo: CategoriaProduccionHuevo): void {
    this.itemsMaples.update((items) =>
      items.map((i) => (i.codigo === codigo ? { ...i, cantidad: i.cantidad + 1 } : i))
    );
  }

  decrementar(codigo: CategoriaProduccionHuevo): void {
    this.itemsMaples.update((items) =>
      items.map((i) =>
        i.codigo === codigo && i.cantidad > 0 ? { ...i, cantidad: i.cantidad - 1 } : i
      )
    );
  }

  actualizarCantidad(codigo: CategoriaProduccionHuevo, event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = Number(input.value);
    const cantidad = isNaN(valor) || valor < 0 ? 0 : Math.floor(valor);

    this.itemsMaples.update((items) =>
      items.map((i) => (i.codigo === codigo ? { ...i, cantidad } : i))
    );
  }

  actualizarHuevosRotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = Number(input.value);
    this.huevosRotos.set(isNaN(valor) || valor < 0 ? 0 : Math.floor(valor));
  }

  solicitarGuardado(): void {
    this.errorMensaje.set(null);

    if (!this.galponSeleccionado()) {
      this.errorMensaje.set('Debés seleccionar un galpón.');
      return;
    }

    if (this.totalMaples() <= 0) {
      this.errorMensaje.set('Debés registrar al menos 1 maple de cualquier categoría para guardar.');
      return;
    }

    const itemsValidos: ItemProduccionHuevo[] = this.itemsMaples()
      .filter((i) => i.cantidad > 0)
      .map((i) => ({
        tipo_huevo: i.codigo,
        cantidad_maples: i.cantidad,
      }));

    const payload: RegistroProduccionPayload = {
      galpon: Number(this.galponSeleccionado()),
      fecha: formatearFechaISO(new Date()),
      items: itemsValidos,
      huevos_rotos: this.huevosRotos(),
      total_maples: this.totalMaples(),
    };

    this.payloadPendiente.set(payload);
    this.mostrarConfirmacion.set(true);
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion.set(false);
    this.payloadPendiente.set(null);
  }

  confirmarYGuardar(): void {
    const payload = this.payloadPendiente();
    if (!payload) return;

    this.isGuardando.set(true);

    this.produccionService.registrarProduccion(payload).subscribe({
      next: () => {
        this.isGuardando.set(false);
        this.mostrarConfirmacion.set(false);
        this.limpiar();
        this.mostrarNotificacion('¡Producción diaria registrada con éxito!');
      },
      error: () => {
        this.isGuardando.set(false);
        this.errorMensaje.set('Ocurrió un error al registrar la producción diaria.');
      },
    });
  }

  limpiar(): void {
    this.galponSeleccionado.set(1);
    this.itemsMaples.update((items) => items.map((i) => ({ ...i, cantidad: 0 })));
    this.huevosRotos.set(0);
    this.errorMensaje.set(null);
    this.payloadPendiente.set(null);
  }

  obtenerNombreGalpon(id: number): string {
    return this.galpones().find((g) => g.id === id)?.nombre ?? `Galpón ${id}`;
  }

  private mostrarNotificacion(mensaje: string): void {
    this.mensajeExito.set(mensaje);
    setTimeout(() => this.mensajeExito.set(null), 3000);
  }
}