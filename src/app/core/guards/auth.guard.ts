import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../services/auth/token.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * Usage:
 * {
 *   path: 'application/:id',
 *   component: ApplicationDetailComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Additional logic based on route data can be added here
    // Example:
    // const requiredRole = route.data['role'];
    // if (requiredRole && !hasRole(requiredRole)) {
    //   router.navigate(['/unauthorized']);
    //   return false;
    // }

    return true;
  }

  // Save the attempted URL for redirecting after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guest Guard - Protects routes that should only be accessible to non-authenticated users
 * Redirects to application detail if user is already logged in
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // User is logged in, redirect to their application detail
  const studentId = tokenService.studentId();
  if (studentId) {
    router.navigate(['/application']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
