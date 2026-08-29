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

  metricas = [
  {
    titulo: 'PEDIDOS PENDIENTES',
    valor: '12',
    icono: 'hgi-task-01',
    color: 'naranja',
    ruta: null
  },
  {
    titulo: 'VENTAS',
    valor: '$37.000',
    icono: 'hgi-money-receive-02',
    color: 'verde',
    ruta: null
  },
  {
    titulo: 'COMPRAS',
    valor: '',
    icono: 'hgi-shopping-cart-01',
    color: 'naranja',
    ruta: '/dashboard/admin/finanzas'
  },
  {
    titulo: 'PRODUCCIÓN',
    valor: '283',
    icono: 'hgi-eggs',
    color: 'verde',
    ruta: null
  }
];


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

  formatearNumero(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '0';

    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return '0';

    // Redondea al entero más cercano y aplica la regex de millares
    return Math.round(numero)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } 
}
