import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check minimum year requirement
 * @param minYear Minimum year allowed (e.g., current year)
 * @returns ValidatorFn
 */
export function minYearValidator(minYear: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // If empty or null, don't validate (let required validator handle it)
    if (!control.value || control.value === '' || control.value === 0) {
      return null;
    }

    const year = parseInt(control.value, 10);

    if (isNaN(year)) {
      return { invalidYear: true };
    }

    if (year < minYear) {
      return {
        minYear: {
          requiredYear: minYear,
          actualYear: year
        }
      };
    }

    return null;
  };
}

/**
 * Validator to check maximum year requirement
 * @param maxYear Maximum year allowed (e.g., current year)
 * @returns ValidatorFn
 */
export function maxYearValidator(maxYear: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const year = parseInt(control.value, 10);

    if (isNaN(year)) {
      return { invalidYear: true };
    }

    if (year > maxYear) {
      return {
        maxYear: {
          requiredYear: maxYear,
          actualYear: year
        }
      };
    }

    return null;
  };
}
