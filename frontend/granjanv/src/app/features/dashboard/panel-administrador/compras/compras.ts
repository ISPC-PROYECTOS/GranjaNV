import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Gasto } from '../../../../core/models/gasto.model';

@Component({
  selector: 'app-compras',
  imports: [ReactiveFormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras {

  formularioGastos: FormGroup;

  fechaMaxima = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {
    this.formularioGastos = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fecha: [this.fechaMaxima, Validators.required],
    });
  }

  // DATOS DE PRUEBA

  gastos: Gasto[] = [
    {
      id: 1,
      descripcion: 'Alimento balanceado',
      categoria: 'Alimento',
      monto: 25000,
      fecha: '10/08/2026',
    },
    {
      id: 2,
      descripcion: 'Medicamentos',
      categoria: 'Insumos',
      monto: 12500,
      fecha: '08/08/2026',
    },
    {
      id: 3,
      descripcion: 'Alambre',
      categoria: 'Mantenimiento',
      monto: 8000,
      fecha: '05/08/2026',
    },
  ];

  get totalGastos(): number {
    return this.gastos.reduce((total, gasto) => total + gasto.monto, 0);
  }

  guardarGasto(): void {
    if (this.formularioGastos.valid){
      console.log(this.formularioGastos.value)
    } else {
      this.formularioGastos.markAllAsTouched();
    }
  }

  limpiarFormulario(): void {
    this.formularioGastos.reset({
      fecha: this.fechaMaxima,
    });
  }
}
