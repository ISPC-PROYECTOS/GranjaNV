import { Component, OnInit, signal, computed, inject, NgZone} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricasService } from '../../../../../core/services/metricas.service';
import { MetricasComerciales } from '../../../../../core/models/reporte.model';
import { CarruselComponent } from '../../../../../shared/carrusel/carrusel';
import { obtenerRangoMesActual, formatearFechaISO } from '../../../../../core/utils/date.utils';
import { SelectorFecha, RangoFechaSeleccionado } from '../../../../../shared/selector-fecha/selector-fecha';


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
    private metricasService = inject(MetricasService);
    private ngZone = inject(NgZone);
  readonly totalVentasMes = signal<number>(0);
  readonly porcentajeVentasVsMesAnterior = signal<number>(0);
  readonly produccionDiariaPromedio = signal<number>(0);
  readonly porcentajePosturaMes = signal<number>(0);
  readonly gananciaNetaMes = signal<number>(0);
  readonly tendenciaProduccion = signal<Array<{ mes: string; promedio: number }>>([]);
  readonly nivelDescripcion = signal<string>('Vista mensual');
  readonly fechaHoy = formatearFechaISO(new Date());


  ngOnInit(): void {
    // 1. Cargamos primero las KPIs prioritarias del mes actual
    this.cargarKpisMesActualYGrafico();
  }

  private cargarKpisMesActualYGrafico(): void {
    const rangoMes = obtenerRangoMesActual();
    
    this.metricasService.getMetricasComerciales(rangoMes.fechaDesde, rangoMes.fechaHasta).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.totalVentasMes.set(Number(data.ventas_del_mes || 0));
          this.porcentajeVentasVsMesAnterior.set(Number(data.porcentaje_cambio_ventas || 0));
          this.produccionDiariaPromedio.set(Number(data.produccion_diaria_promedio || 0));
          this.porcentajePosturaMes.set(Number(data.porcentaje_postura_mes || 0));
          this.gananciaNetaMes.set(Number(data.ganancia_neta_mensual || 0));
        });

        // 2. Una vez listas las KPIs, llamamos al gráfico inicial (asegurate que se llame así en tu clase)
        this.cargarTendenciaInicial(); 
      },
      error: (err) => {
        console.error('Error al cargar KPIs:', err);
        this.cargarTendenciaInicial();
      }
    });
  }

  // Carga inicial del gráfico desde el 1 de enero hasta la fecha actual
  private cargarTendenciaInicial(): void {
    const anioActual = new Date().getFullYear();
    const fechaDesde = `${anioActual}-01-01`;
    const fechaHasta = formatearFechaISO(new Date());

    this.cargarTendenciaGrafico(fechaDesde, fechaHasta);
  }

  // Método específico para actualizar exclusivamente el gráfico al usar el selector
  private cargarTendenciaGrafico(fechaDesde: string, fechaHasta: string): void {
    this.metricasService.getMetricasComerciales(fechaDesde, fechaHasta).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.tendenciaProduccion.set(data.tendencia_produccion_meses || []);
          this.nivelDescripcion.set(data.nivel_descripcion || 'Vista mensual');
        });
      },
      error: (err) => console.error('Error al cargar tendencia de producción:', err)
    });
  }

onCambioRango(rango: RangoFechaSeleccionado) {
    if (rango.fechaDesde && rango.fechaHasta) {
      const hoyISO = formatearFechaISO(new Date());
      
      // Si la fecha hasta seleccionada es mayor a hoy, la limitamos estrictamente a hoy
      const fechaHastaReal = rango.fechaHasta > hoyISO ? hoyISO : rango.fechaHasta;

      // Nos aseguramos también de que fecha desde no sea mayor a hoy
      const fechaDesdeReal = rango.fechaDesde > hoyISO ? hoyISO : rango.fechaDesde;

      this.cargarTendenciaGrafico(fechaDesdeReal, fechaHastaReal);
    }
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

  readonly graficosSlides = [
    { id: 'ventas', tipo: 'barras' },
    { id: 'tendencia', tipo: 'produccion' }
  ];
  
  getMaxPromedio(): number {
  const puntos = this.tendenciaProduccion();
  if (!puntos.length) return 100;
  const max = Math.max(...puntos.map(p => p.promedio));
  return max > 0 ? Math.ceil(max) : 10;
}

getMinPromedio(): number {
  const puntos = this.tendenciaProduccion();
  if (!puntos.length) return 0;
  const min = Math.min(...puntos.map(p => p.promedio));
  return min > 0 ? Math.floor(min) : 0;
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

  // Calcula la posición vertical Y de forma dinámica según el valor máximo actual de los datos
  calcularY(valor: number): number {
    const puntos = this.tendenciaProduccion();
    // Si no hay puntos o el máximo es 0, usamos un tope por defecto de 100
    const maxValor = puntos.length > 0 ? Math.max(...puntos.map(p => p.promedio)) : 100;
    const techo = maxValor > 0 ? maxValor * 1.15: 100; // Delineamos un 15% extra arriba para que el pico no toque el borde del SVG
    
    const yMax = 25;  // Arriba
    const yMin = 165; // Abajo
    
    if (techo <= 0) return yMin;
    
    const proporcion = Math.min(Math.max(valor / techo, 0), 1);
    return yMin - (proporcion * (yMin - yMax));
  }

  // Genera la cadena de puntos 'x1,y1 x2,y2 ...' para la línea <polyline>
  obtenerPuntosPolyline(): string {
    const puntos = this.tendenciaProduccion();
    if (puntos.length === 0) return '';
    return puntos.map((p, i) => `${this.calcularX(i, puntos.length)},${this.calcularY(p.promedio)}`).join(' ');
  }
}