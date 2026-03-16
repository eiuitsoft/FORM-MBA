import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface EducationFileValidationInput {
  alwaysRequired: boolean;
  isEnteredRecord: boolean;
  requireRecognition: boolean;
  requireEnglishMedium: boolean;
  degreeFileCount: number;
  transcriptFileCount: number;
  recognitionFileCount: number;
  englishMediumFileCount: number;
}

export interface EducationFileValidationErrors extends ValidationErrors {
  missingDegreeFile?: true;
  missingTranscriptFile?: true;
  missingRecognitionFile?: true;
  missingEnglishMediumFile?: true;
}

export function evaluateEducationFileValidation(
  input: EducationFileValidationInput
): EducationFileValidationErrors | null {
  const shouldValidate = input.alwaysRequired || input.isEnteredRecord;
  if (!shouldValidate) {
    return null;
  }

  const errors: EducationFileValidationErrors = {};

  if ((input.degreeFileCount || 0) <= 0) {
    errors['missingDegreeFile'] = true;
  }

  if ((input.transcriptFileCount || 0) <= 0) {
    errors['missingTranscriptFile'] = true;
  }

  if (input.requireRecognition && (input.recognitionFileCount || 0) <= 0) {
    errors['missingRecognitionFile'] = true;
  }

  if (input.requireEnglishMedium && (input.englishMediumFileCount || 0) <= 0) {
    errors['missingEnglishMediumFile'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function hasAnyFilledField(control: AbstractControl, fields: string[]): boolean {
  return fields.some((field) => {
    const value = control.get(field)?.value;
    return value !== null && value !== undefined && value.toString().trim() !== '';
  });
}

export function educationFileRequiredValidator(config: {
  alwaysRequired: boolean;
  enteredFields: string[];
  requireRecognition: (group: AbstractControl) => boolean;
  requireEnglishMedium: (group: AbstractControl) => boolean;
}): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const degreeFiles = group.get('degreeFiles')?.value;
    const transcriptFiles = group.get('transcriptFiles')?.value;
    const recognitionFiles = group.get('recognitionFiles')?.value;
    const englishMediumFiles = group.get('englishMediumFiles')?.value;

    return evaluateEducationFileValidation({
      alwaysRequired: config.alwaysRequired,
      isEnteredRecord: hasAnyFilledField(group, config.enteredFields),
      requireRecognition: config.requireRecognition(group),
      requireEnglishMedium: config.requireEnglishMedium(group),
      degreeFileCount: Array.isArray(degreeFiles) ? degreeFiles.length : 0,
      transcriptFileCount: Array.isArray(transcriptFiles) ? transcriptFiles.length : 0,
      recognitionFileCount: Array.isArray(recognitionFiles) ? recognitionFiles.length : 0,
      englishMediumFileCount: Array.isArray(englishMediumFiles) ? englishMediumFiles.length : 0
    });
  };
}
