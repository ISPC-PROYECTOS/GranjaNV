import { Routes } from '@angular/router';

export const routes: Routes = [// Ruta pública por defecto
  {
    path: '',
    redirectTo: 'auth/auth',
    pathMatch: 'full'
  },
  /*{
    path: 'public',
    loadComponent: () => import('./features/public/public').then(m => m.PublicComponent)
  }, */

  // Vista de Login
  {
    path: 'auth/auth',
    loadComponent: () => import('./features/auth/auth').then(m => m.LoginComponent)
  },
{
    path: '**',
    redirectTo: 'auth/login'
  }
];