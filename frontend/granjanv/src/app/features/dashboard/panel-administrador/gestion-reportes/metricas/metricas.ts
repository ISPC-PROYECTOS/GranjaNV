import { Component, OnInit, signal, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../../../../../core/services/reporte.service';
import { MetricasComerciales } from '../../../../../core/models/reporte.model';
import { CarruselComponent } from '../../../../../shared/carrusel/carrusel';
import { SelectorFecha } from '../../../../../shared/selector-fecha/selector-fecha';


export interface IndicadorClave {
    titulo: string;
    valor: string;
    subtexto: string;
    icono: string;
}

@Component({
  selector: 'app-metricas',
  standalone: true,
  imports: [CommonModule, CarruselComponent, SelectorFecha],
  templateUrl: './metricas.html',
  styleUrl: './metricas.css'
})
export class Metricas implements OnInit {
    private reportesService = inject(ReportesService);

  readonly totalVentasMes = signal<number>(0);
  readonly porcentajeVentasVsMesAnterior = signal<number>(0);
  readonly produccionDiariaPromedio = signal<number>(0);
  readonly porcentajePosturaMes = signal<number>(0);
  readonly gananciaNetaMes = signal<number>(0);
  readonly tendenciaProduccion = signal<Array<{ mes: string; promedio: number }>>([]);
  readonly nivelDescripcion = signal<string>('Vista mensual');


  ngOnInit(): void {
    this.cargarMetricasDesdeBackend();
  }

 cargarMetricasDesdeBackend(fechaDesde?: string, fechaHasta?: string) {
  this.reportesService.getMetricasComerciales(fechaDesde, fechaHasta).subscribe({
    next: (data) => {
      this.totalVentasMes.set(Number(data.ventas_del_mes));
      this.porcentajeVentasVsMesAnterior.set(Number(data.porcentaje_cambio_ventas));
      this.produccionDiariaPromedio.set(Number(data.produccion_diaria_promedio));
      this.porcentajePosturaMes.set(Number(data.porcentaje_postura_mes));
      this.gananciaNetaMes.set(Number(data.ganancia_neta_mensual));
      this.tendenciaProduccion.set(data.tendencia_produccion_meses || []);
      this.nivelDescripcion.set(data.nivel_descripcion || 'Vista mensual');
    },
    error: (err) => {
      console.error('Error al cargar las métricas desde la API:', err);
    }
  });
}

onCambioRango(rango: { fechaDesde: string; fechaHasta: string }) {
  this.cargarMetricasDesdeBackend(rango.fechaDesde, rango.fechaHasta);
}

  // Lista armada para dibujar las 3 tarjetas superiores de forma limpia
  readonly tarjetasKpi = computed<IndicadorClave[]>(() => [
    {
      titulo: 'VENTAS DEL MES',
      valor: `$${this.formatearNumero(this.totalVentasMes())}`,
      subtexto: `+ ${this.porcentajeVentasVsMesAnterior()}% vs mes anterior`,
      icono: 'hgi-ticket-02',
    },
    {
      titulo: 'PRODUCCIÓN PROMEDIO',
      valor: this.produccionDiariaPromedio().toString(),
      subtexto: `Maples por día`,
      icono: 'hgi-analytics-01',
    },
    {
      titulo: 'PORCENTAJE DE POSTURA',
      valor: `${this.porcentajePosturaMes()}%`,
      subtexto: 'Efectividad del mes',
      icono: 'hgi-eggs', // Ícono específico de huevos
    },
    {
      titulo: 'GANANCIA NETA',
      valor: `$${this.formatearNumero(this.gananciaNetaMes())}`,
      subtexto: 'Mensual',
      icono: 'hgi-calculate',
    },
  ]);

  // Función para dar formato con puntos de miles (ej: 137.000)
  formatearNumero(valor: number): string {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  
  esPicoMaximo(punto: { mes: string; promedio: number }): boolean {
    const puntos = this.tendenciaProduccion();
    if (!puntos.length) return false;
    const max = Math.max(...puntos.map(p => p.promedio));
    const index = puntos.findIndex(p => p.promedio === max);
    return puntos[index] === punto;
  }

  
  esPicoMinimo(punto: { mes: string; promedio: number }): boolean {
    const puntos = this.tendenciaProduccion();
    if (!puntos.length) return false;
    const max = Math.max(...puntos.map(p => p.promedio));
    const min = Math.min(...puntos.map(p => p.promedio));
    if (min === max) return false; 
    
    const index = puntos.findIndex(p => p.promedio === min);
    return puntos[index] === punto;
  }

  
  // Calcula la posición horizontal X en base al índice del mes
  calcularX(index: number, total: number): number {
    if (total <= 1) return 250;
    const inicio = 45;
    const fin = 515;
    return inicio + (index * (fin - inicio) / (total - 1));
  }

  // Calcula la posición vertical Y en base al valor (con un tope máximo estimado de 1000 maples)
  calcularY(valor: number): number {
    const maxValor = 2000; // Ajustable según el tope de producción esperado
    const yMax = 25;  // Arriba
    const yMin = 165; // Abajo
    const proporcion = Math.min(Math.max(valor / maxValor, 0), 1);
    return yMin - (proporcion * (yMin - yMax));
  }

  // Genera la cadena de puntos 'x1,y1 x2,y2 ...' para la línea <polyline>
  obtenerPuntosPolyline(): string {
    const puntos = this.tendenciaProduccion();
    if (puntos.length === 0) return '';
    return puntos.map((p, i) => `${this.calcularX(i, puntos.length)},${this.calcularY(p.promedio)}`).join(' ');
  }
}