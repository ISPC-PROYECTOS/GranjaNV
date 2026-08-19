import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { routes } from '../../../../app.routes';

@Component({
  selector: 'app-panel-de-control',
  imports: [RouterLink],
  templateUrl: './panel-de-control.html',
  styleUrl: './panel-de-control.css',
})
export class PanelDeControl {}
