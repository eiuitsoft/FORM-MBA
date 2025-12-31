import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TokenService } from '../../../core/services/auth/token.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly tokenService = inject(TokenService); // Make public to use in template
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  // Signals
  showMobileMenu = signal(false);
  showUserMenu = signal(false);
  currentLang: string = localStorage.getItem('lang') || 'en';

  constructor() {
    this.translate.use(this.currentLang);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navbar = target.closest('.navbar');
    
    // Nếu click ra ngoài navbar thì đóng cả 2 menu
    if (!navbar) {
      this.showUserMenu.set(false);
      this.showMobileMenu.set(false);
    }
  }

  // Computed signals from TokenService
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

  closeMenu(): void {
    this.showMobileMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
  }

  logout(): void {
    // Use AuthService logout to ensure all cleanup is done
    this.authService.logout();
    this.showUserMenu.set(false);
    this.router.navigate(['/login']);
  }

  // Language switching (example implementation)

  switchLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'vi' : 'en';
    this.translate.use(this.currentLang);
    localStorage.setItem('lang', this.currentLang);
    // Implement actual language switching logic here
  }
}
