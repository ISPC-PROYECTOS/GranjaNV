export enum TipoCliente {
  MAYORISTA = 'MAYORISTA',
  MINORISTA = 'MINORISTA'
}

export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  email: string;
  tipo: TipoCliente;
  tipo_display?: string;
  activo?: boolean;
}