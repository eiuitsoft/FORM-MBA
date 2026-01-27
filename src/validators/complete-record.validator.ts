import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check that if any field in a group is filled, all must be filled
 * @param fields Array of field names to check
 */
export function completeRecordValidator(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const values = fields.map((f) => group.get(f)?.value);
    const hasAny = values.some((v) => v !== null && v !== undefined && v.toString().trim() !== '');
    const hasAll = values.every((v) => v !== null && v !== undefined && v.toString().trim() !== '');

    if (hasAny && !hasAll) {
      return { incompleteRecord: true };
    }

    return null;
  };
}
