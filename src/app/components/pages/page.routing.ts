import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '../../core/guards/auth.guard';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { FormRegisterComponent } from './form-register/form-register.component';

export const PageRoutes: Routes = [
  {
    path: '',
    component: FormRegisterComponent,
    canActivate: [guestGuard],
    pathMatch: "full",
  },
  {
    path: "register",
    component: FormRegisterComponent,
  },
  {
    path: "application",
    component: ApplicationDetailComponent,
    canActivate: [authGuard], // Requires authentication
  },
  // {
  //   path: "**",
  //   component: NotFoundComponent,
  //   canActivate: [guestGuard],
  // },
];
