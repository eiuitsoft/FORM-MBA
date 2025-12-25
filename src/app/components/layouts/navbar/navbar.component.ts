import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TokenService } from '../../../core/services/auth/token.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly tokenService = inject(TokenService); // Make public để dùng trong template
  private readonly router = inject(Router);

  // Signals
  showMobileMenu = signal(false);
  showUserMenu = signal(false);

  // Computed signals từ TokenService
  get isLoggedIn(): boolean {
    return !!this.tokenService.token();
  }

  get fullName(): string {
    return this.tokenService.fullName();
  }

  get profileCode(): string {
    return this.tokenService.profileCode();
  }

  toggleMenu(): void {
    this.showMobileMenu.update(show => !show);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
  }

  logout(): void {
    this.tokenService.clearAll();
    this.showUserMenu.set(false);
    this.router.navigate(['/login']);
  }
}
