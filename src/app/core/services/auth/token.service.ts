import { Injectable, signal, effect } from '@angular/core';

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
}
