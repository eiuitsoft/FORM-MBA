import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator cho Email format nâng cao
 * Check format email chuẩn hơn built-in Validators.email
 */
export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const email = control.value.trim().toLowerCase();
    
    // Regex email chuẩn RFC 5322
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    
    if (!emailRegex.test(email)) {
      return { invalidEmailFormat: true };
    }
    
    // Check domain có ít nhất 2 ký tự
    const domain = email.split('@')[1];
    if (domain && domain.length < 3) {
      return { invalidDomain: true };
    }
    
    return null;
  };
}
