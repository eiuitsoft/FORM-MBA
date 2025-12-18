import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

/**
 * Async validator để check field có unique không
 * Tự động debounce 1s trước khi gọi API
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

    // Đợi 1s rồi mới gọi API (debounce effect)
    return timer(1000).pipe(
      switchMap(() => checkFn(control.value)),
      map(exists => exists ? { [errorKey]: true } : null),
      catchError(() => of(null)) // Nếu API lỗi, bỏ qua validation
    );
  };
}
