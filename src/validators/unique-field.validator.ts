import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

/**
 * Async validator to check if field is unique
 * Automatically debounces 1s before calling API
 * @param checkFn Function to check (call service)
 * @param errorKey Error key (e.g. 'passportExists', 'mobileExists')
 */
export function uniqueFieldValidator(
  checkFn: (value: string) => Observable<boolean>,
  errorKey: string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // If field is empty, don't validate
    if (!control.value) {
      return of(null);
    }

    // Wait 1s before calling API (debounce effect)
    return timer(1000).pipe(
      switchMap(() => checkFn(control.value)),
      map(exists => exists ? { [errorKey]: true } : null),
      catchError(() => of(null)) // If API error, skip validation
    );
  };
}

/**
 * Async validator to check if field is unique, but ignore original value
 * Used for edit form - only check duplicate when value changes
 * @param checkFn Function to check (call service)
 * @param errorKey Error key (e.g. 'passportExists', 'mobileExists')
 * @param originalValue Original value (don't check if current value = original value)
 */
export function uniqueFieldValidatorWithOriginal(
  checkFn: (value: string) => Observable<boolean>,
  errorKey: string,
  originalValue: string | null | undefined
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // If field is empty, don't validate
    if (!control.value) {
      return of(null);
    }

    // Extract actual value (handle ngx-intl-tel-input object)
    let currentValue = control.value;
    if (typeof currentValue === 'object' && currentValue?.e164Number) {
      currentValue = currentValue.e164Number;
    }

    // If value is same as original value, no need to check duplicate
    if (currentValue === originalValue) {
      return of(null);
    }

    // Wait 1s before calling API (debounce effect)
    return timer(1000).pipe(
      switchMap(() => checkFn(currentValue)),
      map(exists => exists ? { [errorKey]: true } : null),
      catchError(() => of(null)) // If API error, skip validation
    );
  };
}
