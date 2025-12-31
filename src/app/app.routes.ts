import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { ApplicationDetailComponent } from "./components/application-detail/application-detail.component";
import { AppComponent } from "../app.component";
import { authGuard, guestGuard } from "./core/guards/auth.guard";
import { NotFoundComponent } from "./components/not-found/not-found.component";

export const routes: Routes = [
  // {
  //   path: 'application/:id',
  //   component: ApplicationDetailComponent,
  //   canActivate: [authGuard] // Requires authentication
  // },
  // {
  //   path: 'edit/:id',
  //   // canActivate: [authGuard],
  //   redirectTo: 'application/:id',
  //   pathMatch: 'full'
  // },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: AppComponent,
  },
  {
    path: "application",
    component: ApplicationDetailComponent,
    canActivate: [authGuard], // Requires authentication
  },
  {
    path: "",
    component: AppComponent,
    canActivate: [guestGuard],
    pathMatch: "full",
  },
  {
    path: "**",
    component: NotFoundComponent,
    canActivate: [guestGuard],
  },
];
