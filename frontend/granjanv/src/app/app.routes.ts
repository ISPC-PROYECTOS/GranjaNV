import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/auth').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard/admin/panel-de-control',
    loadComponent: () =>
      import('./features/dashboard/panel-administrador/panel-de-control/panel-de-control').then(
        (m) => m.PanelDeControl,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'dashboard/admin/finanzas',
    loadComponent: () =>
      import('./features/dashboard/panel-administrador/compras/compras').then((m) => m.Compras),
    canActivate: [adminGuard],
  },
  {
    path: 'dashboard/admin/registro-usuario',
    loadComponent: () =>
      import('./features/dashboard/panel-administrador/registro-usuario/registro-usuario').then(
        (m) => m.RegistroUsuarioComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'dashboard/admin/ventas',
    loadComponent: () =>
      import('./features/dashboard/panel-administrador/ventas/ventas').then((m) => m.Ventas),
    canActivate: [adminGuard],
  },
  {
    path: 'dashboard/produccion',
    loadComponent: () =>
      import('./features/dashboard/panel-produccion/panel-produccion').then(
        (m) => m.PanelProduccion,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/admin/gestion-reportes',
    loadComponent: () =>
      import('./features/dashboard/panel-administrador/gestion-reportes/gestion-reportes').then(
        (m) => m.GestionReportes,
      ),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'reportes', pathMatch: 'full' },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/dashboard/panel-administrador/gestion-reportes/reportes/reportes').then(
            (m) => m.Reportes,
          ),
      },
      {
        path: 'metricas',
        loadComponent: () =>
          import('./features/dashboard/panel-administrador/gestion-reportes/metricas/metricas').then(
            (m) => m.Metricas,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/dashboard/panel-administrador/gestion-reportes/usuarios/usuarios').then(
            (m) => m.Usuarios,
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/dashboard/panel-administrador/gestion-reportes/clientes/clientes').then(
            (m) => m.Clientes,
          ),
      },
      {
        path: 'galpones',
        loadComponent: () =>
          import('./features/dashboard/panel-administrador/gestion-reportes/galpones/galpones').then(
            (m) => m.Galpones,
          ),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundComponent),
  },
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home), pathMatch: 'full' },
  { path: '**', redirectTo: '/404' },
];
