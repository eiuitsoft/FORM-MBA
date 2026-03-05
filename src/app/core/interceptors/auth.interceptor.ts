import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/auth/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.token();

  // Proactive check: if token exists but is expired → logout immediately
  if (token && tokenService.isTokenExpired()) {
    tokenService.clearAll();
    router.navigate(['/login'], {
      queryParams: { reason: 'session_expired' }
    });
    return throwError(() => new Error('AUTH.SESSION_EXPIRED'));
  }

  // Clone request and add Authorization header if token exists and valid
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        // Network error - use translation key as error code
        errorMessage = 'COMMON.NETWORK_ERROR';
      } else if (error.status === 401) {
        // Unauthorized - redirect to login
        tokenService.clearAll();
        router.navigate(['/login'], {
          queryParams: { reason: 'session_expired' }
        });
        errorMessage = 'AUTH.SESSION_EXPIRED';
      } else {
        // Server-side error - prioritize backend message
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.errors) {
          // ASP.NET Core validation errors (ProblemDetails)
          const errors = Object.values(error.error.errors).flat();
          errorMessage = errors.join('. ') || error.error.title || 'COMMON.SYSTEM_ERROR';
        } else {
          errorMessage = error.error?.message || error.error?.title || error.error?.Detail || error.message || 'COMMON.SYSTEM_ERROR';
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        error: error.error
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};
