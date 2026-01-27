import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check at least 1 of the English qualifications must be filled
 * (IELTS or TOEFL or Other)
 */
export function atLeastOneEnglishQualificationValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ieltsScore = control.get('ielts.score')?.value;
    const toeflScore = control.get('toefl.score')?.value;
    const otherName = control.get('other.name')?.value;
    const otherScore = control.get('other.score')?.value;

    // Check if at least one qualification is filled
    const hasIelts = ieltsScore && ieltsScore.toString().trim() !== '';
    const hasToefl = toeflScore && toeflScore.toString().trim() !== '';
    const hasOther = (otherName && otherName.trim() !== '') || (otherScore && otherScore.toString().trim() !== '');

    if (!hasIelts && !hasToefl && !hasOther) {
      return { atLeastOneRequired: true };
    }

    return null;
  };
}

/**
 * Validator to check that if any field in a group is filled, all must be filled
 * @param fields Array of field names to check
 */
export function completeQualificationValidator(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const values = fields.map((f) => group.get(f)?.value);
    const hasAny = values.some((v) => v !== null && v !== undefined && v.toString().trim() !== '');
    const hasAll = values.every((v) => v !== null && v !== undefined && v.toString().trim() !== '');

    if (hasAny && !hasAll) {
      return { incompleteQualification: true };
    }

    return null;
  };
}
