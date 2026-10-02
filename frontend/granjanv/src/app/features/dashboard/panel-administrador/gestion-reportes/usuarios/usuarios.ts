import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../../../../core/models/user.model';
import { UsuariosService } from '../../../../../core/services/usuarios.service';
import { RegistroUsuarioComponent } from '../../registro-usuario/registro-usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RegistroUsuarioComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly altaAbierta = signal(false);
  readonly usuarioEditando = signal<Usuario | null>(null);
  readonly guardando = signal(false);

  readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['Empleado' as Usuario['rol'], Validators.required],
    password: ['', Validators.minLength(8)],
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la nómina de usuarios.');
        this.cargando.set(false);
      },
    });
  }

  abrirEdicion(usuario: Usuario): void {
    this.error.set(null);
    this.usuarioEditando.set(usuario);
    this.formulario.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      password: '',
    });
  }

  cerrarEdicion(): void {
    this.usuarioEditando.set(null);
    this.formulario.reset();
  }

  guardarEdicion(): void {
    const usuario = this.usuarioEditando();
    if (!usuario || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const payload: Partial<Usuario> & { password?: string } = {
      nombre: datos.nombre?.trim() ?? '',
      apellido: datos.apellido?.trim() ?? '',
      email: datos.email?.trim() ?? '',
      rol: datos.rol ?? 'Empleado',
    };
    if (datos.password) payload.password = datos.password;

    this.guardando.set(true);
    this.error.set(null);
    this.usuariosService.actualizarUsuario(usuario.id_usuario, payload).subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) =>
          lista.map((item) => item.id_usuario === actualizado.id_usuario ? actualizado : item),
        );
        this.guardando.set(false);
        this.cerrarEdicion();
      },
      error: (respuesta) => {
        this.guardando.set(false);
        this.error.set(
          respuesta.error?.email?.[0] ?? 'No se pudo actualizar el usuario. Revisá los datos.',
        );
      },
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    const nombre = `${usuario.nombre} ${usuario.apellido}`;
    if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;

    this.error.set(null);
    this.usuariosService.eliminarUsuario(usuario.id_usuario).subscribe({
      next: () => this.usuarios.update((lista) =>
        lista.filter((item) => item.id_usuario !== usuario.id_usuario),
      ),
      error: () => this.error.set('No se pudo eliminar el usuario.'),
    });
  }

  usuarioCreado(usuario: Usuario): void {
    this.usuarios.update((lista) => [...lista, usuario]);
    this.altaAbierta.set(false);
  }

  iniciales(usuario: Usuario): string {
    return `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();
  }
}