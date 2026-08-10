import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/auth';
import { RegistroUsuarioComponent } from './features/dashboard/panel-administrador/registro-usuario/registro-usuario';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  {
    path: 'dashboard/admin/registro-usuario',
    component: RegistroUsuarioComponent,
    canActivate: [adminGuard]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];