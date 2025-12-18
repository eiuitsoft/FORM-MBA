import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator cho Passport/ID format
 * Cho phép 6-12 ký tự (cover cả passport quốc tế và CMND/CCCD VN)
 * Chỉ chứa chữ và số, KHÔNG bắt buộc phải có chữ
 */
export function passportFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const value = control.value.trim();
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    
    // Cho phép 6-12 ký tự
    if (cleaned.length < 6 || cleaned.length > 12) {
      return { invalidLength: true };
    }
    
    // Chỉ cho phép chữ và số
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
      return { invalidFormat: true };
    }
    
    return null;
  };
}
