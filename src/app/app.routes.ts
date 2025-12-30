import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { AppComponent } from '../app.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'application/:id',
    component: ApplicationDetailComponent,
    canActivate: [authGuard] // Requires authentication
  },
  {
    path: 'edit/:id',
    // canActivate: [authGuard],
    redirectTo: 'application/:id',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppComponent
  }
];
