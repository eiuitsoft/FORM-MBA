import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AlertService } from '../../core/services/alert/alert.service';
import { TokenService } from '../../core/services/auth/token.service';
import { SendOTP } from '../../core/models/auth/send-otp.model';
import { LoginOTP } from '../../core/models/auth/login-otp.model';
import { LoginMethodEnum } from '../../core/enums/login-method.enum';
import { LOGIN_METHODS } from '../../core/constants/login-method.const';
import { SEND_OTP_TYPE, SEND_OTP_TYPE_LIST, SEND_OTP_TYPE_MAP } from '../../core/constants/send-otp-type.const';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  // Signals for reactive state
  isSubmitted = signal(false);
  isSendingOTP = signal(false);
  showFormSendOTP = signal(true);
  showResendButton = signal(false);
  countdown = signal(0);
  profileCode = signal<string | null>(null); // Đổi từ studentId sang profileCode
  isErrorOTP = signal(false);
  showModalChooseOTP = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Constants
  loginMethods = LOGIN_METHODS;
  LoginMethodEnum = LoginMethodEnum;
  sendOtpTypeList = SEND_OTP_TYPE_LIST;
  sendOtpTypeMap = SEND_OTP_TYPE_MAP;
  SEND_OTP_TYPE = SEND_OTP_TYPE;

  private countdownTimer: any;

  loginForm: FormGroup = this.fb.group({
    method: [LoginMethodEnum.PHONE_NUMBER],
    value: ['', [Validators.required, Validators.maxLength(12), Validators.pattern('^[0-9]+$')]],
    otp: ['', Validators.maxLength(6)],
    sendType: [SEND_OTP_TYPE.SMS]
  });

  ngOnInit(): void {
    this.checkLogin();
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  /**
   * Check if user is already logged in
   */
  checkLogin(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Change validators based on login method
   */
  changeLoginMethod(method: LoginMethodEnum): void {
    const valueControl = this.loginForm.get('value');
    valueControl?.clearValidators();

    if (method === LoginMethodEnum.CCCD) {
      valueControl?.setValidators([
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern('^[0-9]+$')
      ]);
    } else if (method === LoginMethodEnum.CODE) {
      valueControl?.setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(7),
        Validators.pattern('^[0-9]+$')
      ]);
    } else {
      valueControl?.setValidators([
        Validators.required,
        Validators.maxLength(12),
        Validators.pattern('^[0-9]+$')
      ]);
    }

    valueControl?.updateValueAndValidity();
  }

  /**
   * Open modal to choose OTP send type
   */
  openModalChooseSendType(): void {
    if (this.loginForm.get('value')?.valid) {
      this.showModalChooseOTP.set(true);
    } else {
      this.errorMessage.set('Vui lòng nhập thông tin hợp lệ!');
      setTimeout(() => this.errorMessage.set(''), 3000);
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModalChooseOTP.set(false);
  }

  /**
   * Send OTP to user
   */
  sendOTP(): void {
    if (!this.loginForm.valid) {
      this.errorMessage.set('Thông tin chưa hợp lệ!');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.isSendingOTP.set(true);
    this.errorMessage.set('');

    const model: SendOTP = {
      value: this.loginForm.value.value,
      method: this.loginForm.value.method,
      sendType: this.loginForm.value.sendType
    };

    this.authService.sendOTP(model).subscribe({
      next: (res) => {
        this.isSendingOTP.set(false);
        this.closeModal();

        if (res.success) {
          this.profileCode.set(res.data?.profileCode || null);
          this.showFormSendOTP.set(false);
          this.setIntervalTimer();
          this.successMessage.set('Mã OTP đã được gửi!');
          this.alertService.successMin('Mã OTP đã được gửi!');
          setTimeout(() => this.successMessage.set(''), 3000);
        } else {
          this.errorMessage.set(res.message || 'Không thể gửi OTP. Vui lòng thử lại.');
          this.alertService.error('Lỗi', res.message || 'Không thể gửi OTP. Vui lòng thử lại.');
        }
      },
      error: (err) => {
        this.isSendingOTP.set(false);
        this.closeModal(); // Đóng modal trước khi hiện toast lỗi
        const errorMsg = err.message || 'Đã có lỗi xảy ra từ hệ thống!';
        this.errorMessage.set(errorMsg);
        this.alertService.error('Lỗi', errorMsg);
        console.error('Send OTP error:', err);
      }
    });
  }

  /**
   * Resend OTP
   */
  resendOTP(): void {
    this.countdown.set(60);
    this.showResendButton.set(false);
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    this.sendOTP();
  }

  /**
   * Start countdown timer
   */
  setIntervalTimer(): void {
    this.countdown.set(60);
    this.countdownTimer = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      }
      if (current === 0) {
        clearInterval(this.countdownTimer);
        this.showResendButton.set(true);
      }
    }, 1000);
  }

  /**
   * Login with OTP
   */
  onLogin(): void {
    const otpValue = this.loginForm.value.otp;
    
    if (!otpValue || otpValue.length !== 6) {
      this.isErrorOTP.set(true);
      return;
    }

    this.isErrorOTP.set(false);
    this.isSendingOTP.set(true);

    const model: LoginOTP = {
      profileCode: this.profileCode(),
      otp: otpValue
    };

    this.authService.loginWithOTP(model).subscribe({
      next: (res) => {
        this.isSendingOTP.set(false);

        if (res.success) {
          // Lưu token và thông tin user vào TokenService
          this.tokenService.token.set(res.data?.token || '');
          this.tokenService.studentId.set(res.data?.mbaStudentId || '');
          this.tokenService.fullName.set(res.data?.fullName || '');
          this.tokenService.profileCode.set(res.data?.profileCode || '');
          
          this.successMessage.set('Đăng nhập thành công! Đang chuyển trang...');
          this.alertService.success('Thành công!', 'Đăng nhập thành công! Đang chuyển trang...', 1500);
          
          // Navigate to application detail page with studentId
          const studentId = res.data?.mbaStudentId;
          setTimeout(() => {
            if (studentId) {
              this.router.navigate(['/application', studentId]);
            } else {
              this.router.navigate(['/']);
            }
          }, 1500);
        } else {
          this.isErrorOTP.set(true);
          const errorMsg = res.message || 'Mã OTP không đúng hoặc đã hết hạn.';
          this.errorMessage.set(errorMsg);
          this.alertService.error('Lỗi', errorMsg);
        }
      },
      error: (err) => {
        this.isSendingOTP.set(false);
        this.isErrorOTP.set(true);
        const errorMsg = err.message || 'Đã có lỗi xảy ra từ hệ thống!';
        this.errorMessage.set(errorMsg);
        this.alertService.error('Lỗi', errorMsg);
        console.error('Login error:', err);
      }
    });
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const method = this.loginForm.value.method;

    if (control.errors['required']) {
      if (fieldName === 'value') {
        if (method === LoginMethodEnum.CCCD) return 'Vui lòng nhập Căn Cước Công Dân';
        if (method === LoginMethodEnum.CODE) return 'Vui lòng nhập mã hồ sơ';
        return 'Vui lòng nhập số điện thoại đã đăng ký';
      }
    }

    if (control.errors['maxlength']) {
      if (fieldName === 'value') {
        if (method === LoginMethodEnum.CCCD) return 'CCCD không quá 15 số';
        if (method === LoginMethodEnum.CODE) return 'Mã hồ sơ không quá 7 số';
        return 'Số điện thoại không quá 12 số';
      }
      if (fieldName === 'otp') return 'Mã OTP không được vượt quá 6 số';
    }

    if (control.errors['minlength']) {
      if (fieldName === 'value' && method === LoginMethodEnum.CODE) {
        return 'Mã hồ sơ tối thiểu 5 số';
      }
    }

    if (control.errors['pattern']) {
      return 'Chỉ được nhập số';
    }

    return '';
  }

  /**
   * Get placeholder text based on method
   */
  getPlaceholder(): string {
    const method = this.loginForm.value.method;
    if (method === LoginMethodEnum.CCCD) return '284501234114';
    if (method === LoginMethodEnum.CODE) return '12345';
    return '0912345678';
  }

  /**
   * Get label text based on method
   */
  getLabel(): string {
    const method = this.loginForm.value.method;
    if (method === LoginMethodEnum.CCCD) return 'Căn cước công dân';
    if (method === LoginMethodEnum.CODE) return 'Mã hồ sơ';
    return 'Số điện thoại đã đăng ký';
  }
}
