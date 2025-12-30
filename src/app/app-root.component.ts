import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/layouts/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar />
    <router-outlet />
  `
})
export class AppRootComponent {}
