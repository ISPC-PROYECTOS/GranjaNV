import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from "@angular/router";
import { AuthService } from '../../core/services/auth-service';

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

  // Inicial dinámica reactiva mediante Signal computed
  usuarioInicial = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return 'U';

    return (u.nombre && u.apellido) 
      ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase() 
      : (u.email ? u.email[0].toUpperCase() : 'U');
  });

  climaInfo: string = '18° Parcialmente nublado';
  fechaActual: string = '';

  ngOnInit(): void {
    this.obtenerFechaFormateada();
  }

  private obtenerFechaFormateada(): void {
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    const hoy = new Date().toLocaleDateString('es-ES', opciones);
    this.fechaActual = hoy.charAt(0).toUpperCase() + hoy.slice(1);
  }

  // Método para verificar la URL actual
  esVistaLogin(): boolean {
    return this.router.url.includes('/auth/login');
  }

  // Método para cerrar sesión vinculado al botón
  cerrarSesion(): void {
    this.authService.logout();
  }
}