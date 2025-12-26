import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for Passport/ID format
 * Allows 6-12 characters (covers international passports and VN CMND/CCCD)
 * Contains only letters and numbers, letters NOT required
 */
export function passportFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const value = control.value.trim();
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    
    // Allow 6-12 characters
    if (cleaned.length < 6 || cleaned.length > 12) {
      return { invalidLength: true };
    }
    
    // Only allow letters and numbers
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
      return { invalidFormat: true };
    }
    
    return null;
  };
}
