import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { AppComponent } from '../app.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'application/:id',
    component: ApplicationDetailComponent
  },
  {
    path: 'edit/:id',
    redirectTo: 'application/:id',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppComponent
  }
];
