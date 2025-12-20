import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator để check ít nhất 1 trong các English qualifications phải được điền
 * (IELTS hoặc TOEFL hoặc Other)
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
