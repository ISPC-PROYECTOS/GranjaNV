import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFoundComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  volver(): void {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/dashboard/admin/panel-de-control']);
      } else {
        this.router.navigate(['/dashboard/produccion/gestion-huevos']);
      }
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}