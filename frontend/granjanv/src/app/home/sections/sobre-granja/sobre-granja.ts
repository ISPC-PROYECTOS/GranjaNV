import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sobre-granja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre-granja.html',
  styleUrls: ['./sobre-granja.css']
})
export class SobreGranja implements OnInit {
  titulo = 'Sobre la Granja';
  descripcion = 'La historia de la Granja y orígenes';

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend
  }
}
