import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/auth/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Clone request and add Authorization header if token exists
  const token = tokenService.token();
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
        errorMessage = 'Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.';
      } else if (error.status === 401) {
        // Unauthorized - redirect to login
        router.navigate(['/login']);
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.status === 400) {
        // Bad request
        errorMessage = error.error?.message || 'Yêu cầu không hợp lệ.';
      } else {
        // Server-side error
        errorMessage = error.message || 'Đã có lỗi xảy ra từ hệ thống.';
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
