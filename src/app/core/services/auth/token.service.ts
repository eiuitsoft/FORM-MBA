import { Injectable, signal, effect } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  iat?: number;
  sub?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Using signals for reactive state management (MBA Student)
  studentId = signal<string>('');
  fullName = signal<string>('');
  token = signal<string>('');
  profileCode = signal<string>('');

  constructor() {
    // Load from localStorage on init
    this.loadFromStorage();
    
    // Auto-save to localStorage when signals change
    effect(() => {
      const tokenValue = this.token();
      if (tokenValue) {
        localStorage.setItem('mba_token', tokenValue);
      } else {
        localStorage.removeItem('mba_token');
      }
    });

    effect(() => {
      const studentIdValue = this.studentId();
      if (studentIdValue) {
        localStorage.setItem('mba_studentId', studentIdValue);
      } else {
        localStorage.removeItem('mba_studentId');
      }
    });

    effect(() => {
      const fullNameValue = this.fullName();
      if (fullNameValue) {
        localStorage.setItem('mba_fullName', fullNameValue);
      } else {
        localStorage.removeItem('mba_fullName');
      }
    });

    effect(() => {
      const profileCodeValue = this.profileCode();
      if (profileCodeValue) {
        localStorage.setItem('mba_profileCode', profileCodeValue);
      } else {
        localStorage.removeItem('mba_profileCode');
      }
    });
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('mba_token');
    const studentId = localStorage.getItem('mba_studentId');
    const fullName = localStorage.getItem('mba_fullName');
    const profileCode = localStorage.getItem('mba_profileCode');

    if (token) this.token.set(token);
    if (studentId) this.studentId.set(studentId);
    if (fullName) this.fullName.set(fullName);
    if (profileCode) this.profileCode.set(profileCode);
  }

  clearAll(): void {
    this.studentId.set('');
    this.fullName.set('');
    this.token.set('');
    this.profileCode.set('');
    
    // Also clear from localStorage
    localStorage.removeItem('mba_token');
    localStorage.removeItem('mba_studentId');
    localStorage.removeItem('mba_fullName');
    localStorage.removeItem('mba_profileCode');
  }

  /**
   * Check if the JWT token is expired
   * @param bufferSeconds Thời gian trừ hao (mặc định 10s) để tránh lệch giờ hoặc lag mạng
   * @returns true if token is expired or invalid, false if still valid
   */
  isTokenExpired(bufferSeconds: number = 10): boolean {
    const token = this.token();
    if (!token) return true;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // Nếu token không có trường exp thì coi như không bao giờ hết hạn (hoặc hết hạn luôn tùy logic dự án)
      if (!decoded.exp) return true;
      const currentTime = Date.now() / 1000;
      // So sánh: Thời gian hết hạn < Thời gian hiện tại + buffer
      // Ví dụ: Còn 5s nữa hết hạn, nhưng buffer là 10s -> Coi như đã hết hạn để trigger refresh token sớm.
      return decoded.exp < (currentTime + bufferSeconds);
    } catch {
      // Invalid token format = treat as expired
      return true;
    }
  }

  /**
   * Check if token exists and is still valid (not expired)
   * @returns true if token exists and is valid, false otherwise
   */
  isTokenValid(): boolean {
    return !!this.token() && !this.isTokenExpired();
  }
}
