export interface Usuario {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'Administrador' | 'Empleado';
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Usuario;
}

export interface RegistroRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'Administrador' | 'Empleado';
}