import { Routes } from "@angular/router";
import { PageComponent } from "./components/page.component";
import { LoginComponent } from "./components/pages/login/login.component";

export const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    loadChildren: () =>
      import('./components/pages/page.routing').then((m) => m.pageRoutes),
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "**",
    redirectTo: '',
  },
];
