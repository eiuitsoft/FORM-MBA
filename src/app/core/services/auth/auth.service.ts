import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AUTH_API } from '../../constants/api.const';
import { OperationResult } from '../../models/general/operation-result';
import { SendOTP } from '../../models/auth/send-otp.model';
import { LoginOTP } from '../../models/auth/login-otp.model';
import { StudentLogin } from '../../models/auth/student-login.model';
import { MBAStudentLogin } from '../../models/auth/mba-student-login.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _tokenService = inject(TokenService);

  // Signals for reactive state
  isFirstLogin = signal<boolean>(false);
  currentStudentId = signal<string | null>(null); // Changed to string for MBA Guid

  /**
   * Send OTP to user via SMS/Email/Zalo
   */
  sendOTP(model: SendOTP): Observable<OperationResult> {
    return this._httpClient.post<OperationResult>(AUTH_API.SEND_OTP, model);
  }

  /**
   * Login with OTP code
   */
  loginWithOTP(model: LoginOTP): Observable<OperationResult> {
    return this._httpClient.post<OperationResult>(AUTH_API.LOGIN_OTP, model).pipe(
      map((res: OperationResult) => {
        if (res.success && res.data?.token) {
          this.saveAuthData(res.data.token);
        }
        return res;
      })
    );
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const userLocal = localStorage.getItem('MBAStudent');
    if (!userLocal) return false;

    try {
      const user = JSON.parse(userLocal) as MBAStudentLogin;
      if (user.token && !this.isTokenExpired(user.token)) {
        this.decodeAndSaveToken(user.token);
        return true;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    return false;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('MBAStudent');
    this._tokenService.clearAll();
    this.isFirstLogin.set(false);
    this.currentStudentId.set(null);
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true;
      
      const expirationDate = decoded.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationDate;
    } catch (error) {
      return true;
    }
  }

  /**
   * Decode JWT token and save to TokenService
   */
  private decodeAndSaveToken(token: string): void {
    try {
      const decoded = jwtDecode(token) as any;
      
      this._tokenService.token.set(token);
      this._tokenService.studentId.set(decoded.mbaStudentId || '');
      this._tokenService.fullName.set(decoded.fullName || '');
      this._tokenService.profileCode.set(decoded.profileCode || '');

      // Save to localStorage for MBA Student
      const mbaStudentData: MBAStudentLogin = {
        mbaStudentId: decoded.mbaStudentId,
        fullName: decoded.fullName,
        email: decoded.email,
        mobile: decoded.mobile,
        profileCode: decoded.profileCode,
        token: token
      };
      localStorage.setItem('MBAStudent', JSON.stringify(mbaStudentData));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  /**
   * Save authentication data after successful login
   */
  private saveAuthData(token: string): void {
    this.decodeAndSaveToken(token);
  }
}
