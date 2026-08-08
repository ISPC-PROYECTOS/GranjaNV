import { Routes } from '@angular/router';

export const routes: Routes = [// Ruta pública por defecto
  {
    path: '',
    redirectTo: 'auth/auth',
    pathMatch: 'full'
  },
  /*{
    path: 'public',
    loadComponent: () => import('./feactures/public/public').then(m => m.PublicComponent)
  }, */

  // Vista de Login
  {
    path: 'auth/auth',
    loadComponent: () => import('./feactures/auth/auth').then(m => m.LoginComponent)
  },
{
    path: '**',
    redirectTo: 'auth/login'
  }
];