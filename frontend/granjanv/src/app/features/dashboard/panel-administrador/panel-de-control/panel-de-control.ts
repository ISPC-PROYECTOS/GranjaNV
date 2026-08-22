import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { routes } from '../../../../app.routes';
import { Gastos } from '../../../../core/services/gastos';

@Component({
  selector: 'app-panel-de-control',
  imports: [RouterLink],
  templateUrl: './panel-de-control.html',
  styleUrl: './panel-de-control.css',
})
export class PanelDeControl {
  private gastosService = inject(Gastos);
  private cdr = inject(ChangeDetectorRef);
  
  totalCompras: number = 0;

  ngOnInit(): void {
  this.cargarTotalCompras();
}

  cargarTotalCompras(): void {
  this.gastosService.obtenerTotalGastos().subscribe({
    next: (respuesta) => {
      this.totalCompras = Number(respuesta.total);
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error al obtener el total de compras:', error);
    }
  });
}
}
