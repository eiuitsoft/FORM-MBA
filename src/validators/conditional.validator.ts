import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to make a field required based on another field's value
 * @param dependentField Name of the field to check
 * @param condition Function that returns true if this field should be required
 * @returns ValidatorFn
 */
export function conditionalRequiredValidator(
  dependentField: string,
  condition: (value: any) => boolean
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const dependentValue = control.parent.get(dependentField)?.value;

    // If condition is met and field is empty, return error
    if (condition(dependentValue) && !control.value) {
      return { conditionalRequired: true };
    }

    return null;
  };
}

/**
 * Validator for score range (e.g., IELTS 0-9, TOEFL 0-120)
 * @param min Minimum score
 * @param max Maximum score
 * @returns ValidatorFn
 */
export function scoreRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const score = parseFloat(control.value);

    if (isNaN(score)) {
      return { invalidScore: true };
    }

    if (score < min || score > max) {
      return {
        scoreRange: {
          min: min,
          max: max,
          actual: score
        }
      };
    }

    return null;
  };
}
