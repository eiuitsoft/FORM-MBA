import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";
import { TokenService } from "../services/auth/token.service";

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * Usage:
 * {
 *   path: 'application',
 *   component: ApplicationDetailComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
};

/**
 * Guest Guard - Protects routes that should only be accessible to non-authenticated users
 * Redirects to application detail if user is already logged in
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const token = inject(TokenService);
  const router = inject(Router);

  // Chỉ cho phép vào login / register khi chưa đăng nhập
  if (!auth.isLoggedIn()) {
    return true;
  }

  // Nếu đã đăng nhập, chuyển hướng dựa trên trạng thái hồ sơ

  return token.studentId()
    ? router.createUrlTree(["/application"])
    : router.createUrlTree(["/login"]);
};
