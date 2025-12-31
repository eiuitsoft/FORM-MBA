import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LOGIN_METHODS } from '../../../core/constants/login-method.const';
import { SEND_OTP_TYPE, SEND_OTP_TYPE_LIST, SEND_OTP_TYPE_MAP } from '../../../core/constants/send-otp-type.const';
import { LoginMethodEnum } from '../../../core/enums/login-method.enum';
import { LoginOTP } from '../../../core/models/auth/login-otp.model';
import { SendOTP } from '../../../core/models/auth/send-otp.model';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TokenService } from '../../../core/services/auth/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  // Signals for reactive state
  isSubmitted = signal(false);
  isSendingOTP = signal(false);
  showFormSendOTP = signal(true);
  showResendButton = signal(false);
  countdown = signal(0);
  profileCode = signal<string | null>(null); // Changed from studentId to profileCode
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
    value: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('^\\+?[0-9]+$')]],
    otp: ['', Validators.maxLength(6)],
    sendType: [SEND_OTP_TYPE.SMS]
  });

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
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
      // Phone number - allow international format with +
      valueControl?.setValidators([
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern('^\\+?[0-9]+$')  // Allow optional + at start
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
      this.errorMessage.set('Please enter valid information!');
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
      this.errorMessage.set('Invalid information!');
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
          this.successMessage.set('OTP code has been sent!');
          this.alertService.successMin('OTP code has been sent!');
          setTimeout(() => this.successMessage.set(''), 3000);
        } else {
          this.errorMessage.set(res.message || 'Unable to send OTP. Please try again.');
          this.alertService.error('Error', res.message || 'Unable to send OTP. Please try again.');
        }
      },
      error: (err) => {
        this.isSendingOTP.set(false);
        this.closeModal();
        const errorMsg = err.message || 'A system error has occurred!';
        this.errorMessage.set(errorMsg);
        this.alertService.error('Error', errorMsg);
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
          // Save token and user info to TokenService
          this.tokenService.token.set(res.data?.token || '');
          this.tokenService.studentId.set(res.data?.mbaStudentId || '');
          this.tokenService.fullName.set(res.data?.fullName || '');
          this.tokenService.profileCode.set(res.data?.profileCode || '');

          this.successMessage.set('Login successful! Redirecting...');
          this.alertService.success('Success!', 'Login successful! Redirecting...', 1500);

          // Navigate to application detail page with studentId
          const studentId = res.data?.mbaStudentId;
          setTimeout(() => {
            if (studentId) {
              // this.router.navigate(['/application', studentId]);
              this.router.navigate(['/application']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1500);
        } else {
          this.isErrorOTP.set(true);
          const errorMsg = res.message || 'OTP code is incorrect or has expired.';
          this.errorMessage.set(errorMsg);
          this.alertService.error('Error', errorMsg);
        }
      },
      error: (err) => {
        this.isSendingOTP.set(false);
        this.isErrorOTP.set(true);
        const errorMsg = err.message || 'A system error has occurred!';
        this.errorMessage.set(errorMsg);
        this.alertService.error('Error', errorMsg);
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
        if (method === LoginMethodEnum.CCCD) return this.translate.instant('LOGIN.ERR_REQUIRED_CITIZEN_ID');
        if (method === LoginMethodEnum.CODE) return this.translate.instant('LOGIN.ERR_REQUIRED_PROFILE_CODE');
        return this.translate.instant('LOGIN.ERR_REQUIRED_PHONE');
      }
    }

    if (control.errors['maxlength']) {
      if (fieldName === 'value') {
        if (method === LoginMethodEnum.CCCD) return this.translate.instant('LOGIN.ERR_MAX_CITIZEN_ID');
        if (method === LoginMethodEnum.CODE) return this.translate.instant('LOGIN.ERR_MAX_PROFILE_CODE');
        return this.translate.instant('LOGIN.ERR_MAX_PHONE');
      }
      if (fieldName === 'otp') return this.translate.instant('LOGIN.OTP_MAX_LENGTH');
    }

    if (control.errors['minlength']) {
      if (fieldName === 'value' && method === LoginMethodEnum.CODE) {
        return this.translate.instant('LOGIN.ERR_MIN_PROFILE_CODE');
      }
    }

    if (control.errors['pattern']) {
      if (fieldName === 'value' && method === LoginMethodEnum.PHONE_NUMBER) {
        return this.translate.instant('LOGIN.ERR_PATTERN_PHONE');
      }
      return this.translate.instant('LOGIN.ERR_PATTERN_NUMBER');
    }

    return '';
  }

  /**
   * Get placeholder text based on method
   */
  getPlaceholder(): string {
    const method = this.loginForm.value.method;
    if (method === LoginMethodEnum.CCCD) return '284501234114';
    if (method === LoginMethodEnum.CODE) return this.translate.instant('LOGIN.ENTER_PROFILE_CODE');
    return this.translate.instant('LOGIN.ENTER_PHONE');
  }

  /**
   * Get label text based on method
   */
  getLabel(): string {
    const method = this.loginForm.value.method;
    if (method === LoginMethodEnum.CCCD) return this.translate.instant('LOGIN.CITIZEN_ID');
    if (method === LoginMethodEnum.CODE) return this.translate.instant('LOGIN.PROFILE_CODE');
    return this.translate.instant('LOGIN.PHONE_NUMBER');
  }
}
