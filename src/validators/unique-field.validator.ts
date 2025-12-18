import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

/**
 * Async validator để check field có unique không
 * @param checkFn Function để check (gọi service)
 * @param errorKey Key của error (vd: 'passportExists', 'mobileExists')
 */
export function uniqueFieldValidator(
  checkFn: (value: string) => Observable<boolean>,
  errorKey: string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // Nếu field rỗng, không validate
    if (!control.value) {
      return of(null);
    }

    // Đợi user gõ xong 500ms rồi mới gọi API
    return of(control.value).pipe(
      debounceTime(500),
      switchMap(value => checkFn(value)),
      map(exists => exists ? { [errorKey]: true } : null),
      catchError(() => of(null)) // Nếu API lỗi, bỏ qua validation
    );
  };
}
