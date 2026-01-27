import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check that date is not in the future
 * @param maxDate Maximum date allowed (default: today)
 * @returns ValidatorFn
 */
export function maxDateValidator(maxDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const compareDate = maxDate || new Date();
    
    // Set time to start of day for fair comparison
    inputDate.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);

    if (inputDate > compareDate) {
      return {
        maxDate: {
          maxDate: compareDate.toISOString().split('T')[0],
          actualDate: inputDate.toISOString().split('T')[0]
        }
      };
    }

    return null;
  };
}

/**
 * Validator to check that end date is after or equal to start date
 * Use this at the FormGroup level
 * @param startDateField Name of the start date field
 * @param endDateField Name of the end date field
 * @returns ValidatorFn
 */
export function dateRangeValidator(startDateField: string, endDateField: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get(startDateField)?.value;
    const endDate = formGroup.get(endDateField)?.value;

    // If either date is missing, don't validate
    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return {
        dateRange: {
          startDate: startDate,
          endDate: endDate
        }
      };
    }

    return null;
  };
}

/**
 * Validator to check that date includes a year greater than or equal to minYear
 * @param minYear Minimum year allowed (e.g. 1900)
 * @returns ValidatorFn
 */
export function minDateYearValidator(minYear: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    
    // Check if date is valid
    if (isNaN(inputDate.getTime())) {
       return { invalidDate: true };
    }

    // Get year from the input date
    const year = inputDate.getFullYear();

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
