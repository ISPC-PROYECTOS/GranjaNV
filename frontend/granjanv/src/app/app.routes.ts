import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/auth';
import { RegistroUsuarioComponent } from './features/dashboard/panel-administrador/registro-usuario/registro-usuario';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
// 🟢 Agregamos la comilla ' que faltaba al final del path
import { PanelDeControl } from './features/dashboard/panel-administrador/panel-de-control/panel-de-control';
import { Compras } from './features/dashboard/panel-administrador/compras/compras';
import { Home } from './home/home';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: '**', redirectTo: '' }
];
