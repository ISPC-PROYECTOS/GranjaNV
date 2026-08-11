import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/auth';
import { RegistroUsuarioComponent } from './features/dashboard/panel-administrador/registro-usuario/registro-usuario';
import { adminGuard } from './core/guards/admin-guard';
// 🟢 Agregamos la comilla ' que faltaba al final del path
import { PanelDeControl } from './features/dashboard/panel-administrador/panel-de-control/panel-de-control';
export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },

  // 🟢 Ruta de Victoria (coincide con la que invoca auth.ts al loguear como Admin)
  { 
    path: 'dashboard/admin/panel-de-control', 
    component: PanelDeControl 
  },
  {
    path: 'dashboard/admin/registro-usuario',
    component: RegistroUsuarioComponent,
    canActivate: [adminGuard]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];