import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/auth';
import { RegistroUsuarioComponent } from './features/dashboard/panel-administrador/registro-usuario/registro-usuario';
import { PanelDeControl } from './features/dashboard/panel-administrador/panel-de-control/panel-de-control';
import { Compras } from './features/dashboard/panel-administrador/compras/compras';
import { NotFoundComponent } from './features/not-found/not-found';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { 
    path: 'dashboard/admin/panel-de-control', 
    component: PanelDeControl,
    canActivate: [adminGuard] 
  },
  {
    path: 'dashboard/admin/finanzas',
    component: Compras,
    canActivate: [adminGuard]
  },
  {
    path: 'dashboard/admin/registro-usuario',
    component: RegistroUsuarioComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'dashboard/admin/ventas',
    loadComponent: () =>
      import('./features/dashboard/panel-administrador/ventas/ventas').then(
        (m) => m.Ventas
      ),
    canActivate: [adminGuard]
  },
  {
    path: 'dashboard/produccion',
    loadComponent: () =>
      import('./features/dashboard/panel-produccion/panel-produccion').then(
        (m) => m.PanelProduccion
      ),
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];