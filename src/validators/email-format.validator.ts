import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for advanced Email format
 * Check email format more strictly than built-in Validators.email
 */
export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const email = control.value.trim().toLowerCase();
    
    // Standard RFC 5322 email regex
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    
    if (!emailRegex.test(email)) {
      return { invalidEmailFormat: true };
    }
    
    // Check domain has at least 2 characters
    const domain = email.split('@')[1];
    if (domain && domain.length < 3) {
      return { invalidDomain: true };
    }
    
    return null;
  };
}
