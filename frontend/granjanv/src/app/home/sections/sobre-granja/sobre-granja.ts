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
  titulo = 'Sobre la granja';
  descripcion = 'La historia de la granja y sus orígenes';

  ngOnInit() {
    // Aquí puedes hacer llamadas al backend
  }
}
