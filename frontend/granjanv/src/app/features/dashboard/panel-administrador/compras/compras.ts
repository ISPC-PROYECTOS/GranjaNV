import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Gasto } from '../../../../core/models/gasto.model';
import { Gastos } from '../../../../core/services/gastos';

@Component({
  selector: 'app-compras',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras implements OnInit {
  private gastosService = inject(Gastos);
  private cdr = inject(ChangeDetectorRef);

  formularioGastos: FormGroup;

  fechaMaxima = new Date().toISOString().split('T')[0];

  gastos: Gasto[] = [];
  totalGastos: number = 0;
  gastoEditandoId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.formularioGastos = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fecha: [this.fechaMaxima, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarGastos();
    this.cargarTotalGastos();
  }

  cargarGastos(): void {
    this.gastosService.obtenerGastos().subscribe({
      next: (gastos) => {
        this.gastos = gastos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener los gastos:', error);
      },
    });
  }

  cargarTotalGastos(): void {
    this.gastosService.obtenerTotalGastos().subscribe({
      next: (respuesta) => {
        this.totalGastos = Number(respuesta.total);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener el total de gastos:', error);
      }
    });
  }

  guardarGasto(): void {
    if (this.formularioGastos.valid) {
      const gasto = this.formularioGastos.value;

      if (this.gastoEditandoId !== null) {
        this.gastosService.actualizarGasto(this.gastoEditandoId, gasto).subscribe({
          next: () => {
            this.cargarGastos();
            this.cargarTotalGastos();
            this.limpiarFormulario();
            this.gastoEditandoId = null;
          },
          error: (error) => {
            console.error('Error al actualizar el gasto:', error);
          },
        });
      } else {
        this.gastosService.crearGasto(gasto).subscribe({
          next: () => {
            this.cargarGastos();
            this.cargarTotalGastos();
            this.limpiarFormulario();
          },
          error: (error) => {
            console.error('Error al guardar el gasto:', error);
          },
        });
      }
    } else {
      this.formularioGastos.markAllAsTouched();
    }
  }

  eliminarGasto(id: number): void {
    const confirmar = window.confirm('¿Estás seguro de que querés eliminar este gasto?');

    if (!confirmar) {
      return;
    }

    this.gastosService.eliminarGasto(id).subscribe({
      next: () => {
        this.cargarGastos();
        this.cargarTotalGastos();
      },
      error: (error) => {
        console.error('Error al eliminar el gasto:', error);
      },
    });
  }

  editarGasto(gasto: Gasto): void {
    this.gastoEditandoId = gasto.id;

    this.formularioGastos.patchValue({
      monto: Number(gasto.monto),
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      fecha: gasto.fecha,
    });
  }

  limpiarFormulario(): void {
    this.formularioGastos.reset({
      fecha: this.fechaMaxima,
    });

    this.gastoEditandoId = null;
  }
}
