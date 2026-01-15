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
    return throwError(() => new Error('Session expired'));
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
        // Network error
        errorMessage = 'Unable to connect to server. Please check your network connection.';
      } else if (error.status === 401) {
        // Unauthorized - redirect to login
        tokenService.clearAll();
        router.navigate(['/login'], {
          queryParams: { reason: 'session_expired' }
        });
        errorMessage = 'Session expired. Please login again.';
      } else {
        // Server-side error - prioritize backend message
        // Backend returns: { statusCode, message, success, data }
        errorMessage = error.error?.message || error.message || 'A system error has occurred.';
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
