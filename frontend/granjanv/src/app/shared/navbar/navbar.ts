import { Component, OnInit, ElementRef, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { WeatherService } from '../../core/services/weather-service';
import { WeatherData } from '../../core/models/weather';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private weatherService = inject(WeatherService);
  private elementRef = inject(ElementRef);

  usuarioInicial = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return 'U';

    return (u.nombre && u.apellido) 
      ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase() 
      : (u.email ? u.email[0].toUpperCase() : 'U');
  });

  fechaActual = signal<string>('');
  clima = signal<WeatherData | null>(null);
  cargandoClima = signal<boolean>(true);
  detallesAbiertos = signal<boolean>(false);

  ngOnInit(): void {
    this.obtenerFechaFormateada();
    this.cargarDatosClima();
  }

  private cargarDatosClima(): void {
    this.cargandoClima.set(true);
    this.weatherService.getClimaActual().subscribe({
      next: (data) => {
        this.clima.set(data);
        this.cargandoClima.set(false);
      },
      error: () => {
        this.cargandoClima.set(false);
      }
    });
  }

  private obtenerFechaFormateada(): void {
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    const hoy = new Date().toLocaleDateString('es-ES', opciones);
    this.fechaActual.set(hoy.charAt(0).toUpperCase() + hoy.slice(1));
  }

  toggleDetallesClima(): void {
    if (!this.cargandoClima() && this.clima()) {
      this.detallesAbiertos.update((v) => !v);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.querySelector('.weather-widget-container')?.contains(targetElement)) {
      this.detallesAbiertos.set(false);
    }
  }

  esVistaLogin(): boolean {
    return this.router.url.includes('/auth/login');
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}