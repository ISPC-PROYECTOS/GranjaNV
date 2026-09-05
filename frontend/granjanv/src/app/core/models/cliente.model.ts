export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  email: string;
  tipo: 'MAYORISTA' | 'MINORISTA';
  tipo_display?: string;
  activo?: boolean;
}