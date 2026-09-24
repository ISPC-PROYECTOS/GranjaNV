import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProduccionService } from '../../../../core/services/produccion.service';
import {
  MotivoMovimientoGallina,
  MovimientoGallinaPayload,
  TipoMovimientoGallina,
} from '../../../../core/models/produccion.model';
import { formatearFechaISO } from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-gestion-gallinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-gallinas.html',
  styleUrl: './gestion-gallinas.css',
})
export class GestionGallinas {
  private readonly produccionService = inject(ProduccionService);

  readonly galpones = this.produccionService.galpones;

  // Estados del formulario
  readonly desplegado = signal<boolean>(false);
  readonly galponSeleccionado = signal<number>(1);
  readonly tipoMovimiento = signal<TipoMovimientoGallina>('SALIDA');
  readonly motivoMovimiento = signal<MotivoMovimientoGallina>('MUERTE');
  readonly cantidadAves = signal<number | null>(null);
  readonly descripcionIncidente = signal<string>('');

  // Estados de control de interfaz
  readonly isGuardando = signal<boolean>(false);
  readonly mostrarConfirmacion = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly errorMensaje = signal<string | null>(null);

  readonly payloadPendiente = signal<MovimientoGallinaPayload | null>(null);

  toggleDesplegable(): void {
    this.desplegado.update((v) => !v);
  }

  cambiarTipo(tipo: TipoMovimientoGallina): void {
    this.tipoMovimiento.set(tipo);
    this.motivoMovimiento.set(tipo === 'SALIDA' ? 'MUERTE' : 'COMPRA');
  }

  solicitarGuardado(): void {
    this.errorMensaje.set(null);

    const cantidad = this.cantidadAves();
    if (!this.galponSeleccionado()) {
      this.errorMensaje.set('Debés seleccionar un galpón.');
      return;
    }

    if (!cantidad || cantidad <= 0) {
      this.errorMensaje.set('Ingresá una cantidad de aves válida (mayor a 0).');
      return;
    }

    const payload: MovimientoGallinaPayload = {
      galpon: Number(this.galponSeleccionado()),
      fecha: formatearFechaISO(new Date()),
      tipo_movimiento: this.tipoMovimiento(),
      motivo_movimiento: this.motivoMovimiento(),
      cantidad_gallinas: Math.floor(cantidad),
      descripcion_movimiento: this.descripcionIncidente().trim() || undefined,
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

    this.produccionService.registrarMovimientoGallinas(payload).subscribe({
      next: () => {
        this.isGuardando.set(false);
        this.mostrarConfirmacion.set(false);
        this.limpiar();
        this.mostrarNotificacion('¡Movimiento de aves registrado con éxito!');
      },
      error: () => {
        this.isGuardando.set(false);
        this.errorMensaje.set('Ocurrió un error al registrar el movimiento.');
      },
    });
  }

  limpiar(): void {
    this.galponSeleccionado.set(1);
    this.tipoMovimiento.set('SALIDA');
    this.motivoMovimiento.set('MUERTE');
    this.cantidadAves.set(null);
    this.descripcionIncidente.set('');
    this.errorMensaje.set(null);
    this.payloadPendiente.set(null);
  }

  obtenerNombreGalpon(id: number): string {
    return this.galpones().find((g) => g.id === id)?.nombre ?? `Galpón ${id}`;
  }

  obtenerTextoMotivo(motivo?: MotivoMovimientoGallina): string {
    const motivos: Record<MotivoMovimientoGallina, string> = {
      MUERTE: 'Mortalidad / Muerte',
      VENTA: 'Venta',
      REHABILITACION: 'Rehabilitación / Aislamiento',
      COMPRA: 'Compra / Incorporación',
      RECUPERADA: 'Recuperadas',
      OTRO: 'Otro',
    };
    return motivo ? (motivos[motivo] ?? motivo) : '';
  }

  private mostrarNotificacion(mensaje: string): void {
    this.mensajeExito.set(mensaje);
    setTimeout(() => this.mensajeExito.set(null), 3000);
  }
}