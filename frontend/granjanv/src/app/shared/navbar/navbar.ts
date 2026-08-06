import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {

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

  cerrarSesion(): void {
    console.log('Cerrando sesión...');
  }
}