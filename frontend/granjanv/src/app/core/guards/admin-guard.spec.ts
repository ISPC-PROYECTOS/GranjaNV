import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';

import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth-service';

describe('adminGuard', () => {
  let authServiceMock: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    isAdmin: ReturnType<typeof signal<boolean>>;
  };
  let routerMock: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: signal(false),
      isAdmin: signal(false),
    };

    routerMock = {
      createUrlTree: vi.fn((commands: string[]) => ({
        toString: () => commands.join('/'),
      } as unknown as UrlTree)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('debe permitir la navegación si el usuario está autenticado y es admin', () => {
    authServiceMock.isAuthenticated.set(true);
    authServiceMock.isAdmin.set(true);

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('debe redirigir a /auth/login si el usuario no está autenticado', () => {
    authServiceMock.isAuthenticated.set(false);
    authServiceMock.isAdmin.set(false);

    executeGuard({} as any, {} as any);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('debe redirigir a /404 si el usuario está autenticado pero no es admin', () => {
    authServiceMock.isAuthenticated.set(true);
    authServiceMock.isAdmin.set(false);

    executeGuard({} as any, {} as any);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/404']);
  });
});