import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Evitar bucles infinitos si falla el propio endpoint de refresh o login
      if (error.status === 401 && !req.url.includes('/token/refresh/') && !req.url.includes('/login/')) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // Reintentar la petición original con el nuevo token de acceso
            const clonedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access}` }
            });
            return next(clonedReq);
          }),
          catchError((refreshError) => {
            // Si el refresh token venció (pasó 1 día), cerrar sesión
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};