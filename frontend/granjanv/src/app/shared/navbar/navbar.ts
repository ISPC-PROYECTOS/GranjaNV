import {
  Component,
  OnInit,
  ElementRef,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { WeatherService } from '../../core/services/weather-service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { WeatherData } from '../../core/models/weather';
import { Notificacion } from '../../core/models/notificacion.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '(document:click)': 'onDocumentClick(\$event)',
  },
})
export class NavbarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly weatherService = inject(WeatherService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly elementRef = inject(ElementRef);

  readonly isAdmin = this.authService.isAdmin;
  readonly notificaciones = this.notificacionesService.notificaciones;
  readonly noLeidasCount = this.notificacionesService.noLeidasCount;
  readonly panelNotificacionesAbierto = signal<boolean>(false);

  modoOscuro = signal<boolean>(false);

  usuarioInicial = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return 'U';
    return u.nombre && u.apellido
      ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase()
      : u.email
        ? u.email[0].toUpperCase()
        : 'U';
  });

  fechaActual = signal<string>('');
  clima = signal<WeatherData | null>(null);
  cargandoClima = signal<boolean>(true);
  detallesAbiertos = signal<boolean>(false);

  constructor() {
    // Reacciona en tiempo real cuando cambia el estado de autenticación/rol
    effect(() => {
      if (this.isAdmin()) {
        this.notificacionesService.cargarNotificaciones();
      }
    });
  }

  ngOnInit(): void {
    const modoGuardado = localStorage.getItem('modoOscuro') === 'true';
    this.modoOscuro.set(modoGuardado);
    document.body.classList.toggle('dark-mode', modoGuardado);

    this.obtenerFechaFormateada();
    this.cargarDatosClima();
  }

  togglePanelNotificaciones(): void {
    this.panelNotificacionesAbierto.update((v) => !v);
  }

  seleccionarNotificacion(notif: Notificacion): void {
    if (!notif.leida) {
      this.notificacionesService.marcarComoLeida(notif.id).subscribe();
    }
    this.panelNotificacionesAbierto.set(false);

    if (notif.ruta) {
      this.router.navigateByUrl(notif.ruta);
    }
  }

  borrarNotificacion(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.notificacionesService.eliminarNotificacion(id).subscribe();
  }

  marcarTodasLeidas(): void {
    this.notificacionesService.marcarTodasComoLeidas().subscribe();
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const domRef = this.elementRef.nativeElement as HTMLElement;

    if (!domRef.querySelector('.weather-widget-container')?.contains(target)) {
      this.detallesAbiertos.set(false);
    }

    if (!domRef.querySelector('.notificaciones-container')?.contains(target)) {
      this.panelNotificacionesAbierto.set(false);
    }
  }

  obtenerIconoNotificacion(tipo: string): string {
    switch (tipo) {
      case 'PEDIDOS_DEL_DIA':
        return 'hgi-task-01';
      case 'MOVIMIENTO_GALLINAS':
        return 'hgi-barns';
      default:
        return 'hgi-notification-01';
    }
  }

  formatearFechaRelativa(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private cargarDatosClima(): void {
    this.cargandoClima.set(true);
    this.weatherService.getClimaActual().subscribe({
      next: (data) => {
        this.clima.set(data);
        this.cargandoClima.set(false);
      },
      error: () => this.cargandoClima.set(false),
    });
  }

  private obtenerFechaFormateada(): void {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    const hoy = new Date().toLocaleDateString('es-ES', opciones);
    this.fechaActual.set(hoy.charAt(0).toUpperCase() + hoy.slice(1));
  }

  toggleDetallesClima(): void {
    if (!this.cargandoClima() && this.clima()) {
      this.detallesAbiertos.update((v) => !v);
    }
  }

  esVistaLogin(): boolean {
    return this.router.url.includes('/auth/login');
  }

  toggleModoOscuro(): void {
    this.modoOscuro.update((v) => !v);
    document.body.classList.toggle('dark-mode', this.modoOscuro());
    localStorage.setItem('modoOscuro', String(this.modoOscuro()));
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}