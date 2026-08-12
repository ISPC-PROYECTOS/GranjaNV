import { Component, OnInit, inject } from '@angular/core';
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

  usuarioInicial: string = 'N';
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

  // Método  verificar la URL actual
  esVistaLogin(): boolean {
    return this.router.url.includes('/auth/login');
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}