import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  grupoEmpresa = 'Granja NV';
  descripcion = 'Producción de huevos frescos y naturales';
  
  contacto = {
    telefono: '+54 (011) XXXX-XXXX',
    email: 'info@granjaNV.com',
    ubicacion: 'Santiago del Estero, Argentina'
  };
  
  horarios = {
    lunes_viernes: '08:00 - 18:00',
    sabados: '09:00 - 13:00',
    domingos: 'Cerrado'
  };
  
  redesSociales = [
    { nombre: 'Facebook', icono: '📘', url: '#' },
    { nombre: 'Instagram', icono: '📷', url: '#' },
    { nombre: 'WhatsApp', icono: '💬', url: '#' }
  ];
  
  anyoActual = new Date().getFullYear();
}
