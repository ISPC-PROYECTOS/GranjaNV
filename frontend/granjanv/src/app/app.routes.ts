import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/auth';
import { RegistroUsuarioComponent } from './features/dashboard/panel-administrador/registro-usuario/registro-usuario';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
import { PanelDeControl } from './features/dashboard/panel-administrador/panel-de-control/panel-de-control';
import { Compras } from './features/dashboard/panel-administrador/compras/compras';
import { NotFoundComponent } from './features/not-found/not-found';

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
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];