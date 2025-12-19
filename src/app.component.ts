
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { of } from 'rxjs';
import { MbaService } from './app/core/services/mba/mba.service';
import { uniqueFieldValidator } from './validators/unique-field.validator';
import { passportFormatValidator } from './validators/passport-format.validator';
import { emailFormatValidator } from './validators/email-format.validator';
import { minAgeValidator } from './validators/age.validator';
import { minYearValidator, maxYearValidator } from './validators/year.validator';
import { maxDateValidator, dateRangeValidator } from './validators/date.validator';
import { scoreRangeValidator } from './validators/conditional.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ReactiveFormsModule, CommonModule, NgxIntlTelInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private readonly _mbaService = inject(MbaService);
  
  submitted = signal(false);
  showDialog = signal(false);
  dialogMessage = signal('');
  dialogType = signal<'success' | 'error'>('success');
  
  currentYear = new Date().getFullYear();
  
  applicationForm: FormGroup = this.fb.group({
    personalDetails: this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      nationality: ['', Validators.required],
      gender: ['Male', Validators.required],
      dateOfBirth: ['', [Validators.required, minAgeValidator(18)]],
      placeOfBirth: ['', Validators.required],
      passportNo: [
        '', 
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
          passportFormatValidator()
        ],
        [uniqueFieldValidator(
          (val) => this._mbaService.checkPassportExists(val),
          'passportExists'
        )]
      ],
      dateIssued: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, emailFormatValidator()]],
      mobile: [
        undefined, 
        [Validators.required],
        [uniqueFieldValidator(
          (val: any) => {
            // Extract e164Number from intl-tel-input object (format: +84845333577)
            const phoneNumber = val?.e164Number || val;
            if (!phoneNumber) return of(false);
            return this._mbaService.checkMobileExists(phoneNumber);
          },
          'mobileExists'
        )]
      ],
      jobTitle: [''],
      organization: [''],
      correspondenceAddress: ['', Validators.required],
      permanentAddress: ['', Validators.required],
    }),
    applicationDetails: this.fb.group({
      programName: [{ value: 'Master of Business Administration', disabled: true }],
      programCode: ['', Validators.required],
      track: ['Application', Validators.required],
      admissionYear: ['', [Validators.required, minYearValidator(new Date().getFullYear())]],
      admissionIntake: ['', Validators.required],
    }),
    educationDetails: this.fb.group({
      undergraduate: this.fb.group({
        university: ['', Validators.required],
        country: ['', Validators.required],
        major: ['', Validators.required],
        graduationYear: ['', [Validators.required, maxYearValidator(new Date().getFullYear())]],
        language: ['', Validators.required],
      }),
      secondDegree: this.fb.group({
        university: [''],
        country: [''],
        major: [''],
        graduationYear: [''],
        language: [''],
      }),
      postgraduate: this.fb.group({
        university: [''],
        country: [''],
        major: [''],
        graduationYear: [''],
        thesisTitle: [''],
        language: [''],
      }),
    }),
    englishQualifications: this.fb.group({
      ielts: this.fb.group({ 
        score: ['', [scoreRangeValidator(0, 9)]], 
        date: ['', [maxDateValidator()]] 
      }),
      toefl: this.fb.group({ 
        score: ['', [scoreRangeValidator(0, 120)]], 
        date: ['', [maxDateValidator()]] 
      }),
      other: this.fb.group({ 
        name: [''], 
        score: [''], 
        date: ['', [maxDateValidator()]] 
      }),
    }),
    employmentHistory: this.fb.group({
      position1: this.fb.group({
        organization: ['', Validators.required],
        title: ['', Validators.required],
        from: ['', Validators.required],
        to: ['', Validators.required],
        address: ['', Validators.required],
      }, { validators: dateRangeValidator('from', 'to') }),
      position2: this.fb.group({
        organization: [''],
        title: [''],
        from: [''],
        to: [''],
        address: [''],
      }, { validators: dateRangeValidator('from', 'to') }),
    }),
    declaration: this.fb.group({
      agreed: [false, Validators.requiredTrue],
    }),
  });

  submitForm(): void {
    this.submitted.set(true);
    
    if (this.applicationForm.valid) {
      // Transform form data to match API structure
      const formData = this.transformFormData();
      
      console.log('Submitting form:', formData);
      
      this._mbaService.add(formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.dialogType.set('success');
            this.dialogMessage.set(res.message || 'Application submitted successfully!');
            this.showDialog.set(true);
            // Reset form after successful submission
            this.applicationForm.reset();
            this.submitted.set(false);
          } else {
            this.dialogType.set('error');
            this.dialogMessage.set(res.message || 'Failed to submit application');
            this.showDialog.set(true);
          }
        },
        error: (err) => {
          console.error('Submit error:', err);
          this.dialogType.set('error');
          this.dialogMessage.set('An error occurred while submitting the application');
          this.showDialog.set(true);
        }
      });
    } else {
      console.error('Form is invalid.');
      this.dialogType.set('error');
      this.dialogMessage.set('Please fill out all required fields before submitting.');
      this.showDialog.set(true);
    }
  }

  private transformFormData(): any {
    const rawValue = this.applicationForm.getRawValue();
    
    return {
      personalDetails: {
        ...rawValue.personalDetails,
        // Extract phone number in E.164 format (e.g., +84845333577)
        mobile: rawValue.personalDetails.mobile?.e164Number || rawValue.personalDetails.mobile,
        // Clean and uppercase passport/ID
        passportNo: rawValue.personalDetails.passportNo?.trim().toUpperCase(),
        // Clean and lowercase email
        email: rawValue.personalDetails.email?.trim().toLowerCase(),
        gender: rawValue.personalDetails.gender === 'Male' ? 1 : 0,
        nationalityId: '11111111-1111-1111-1111-111111111111', // TODO: Get from dropdown
        nationalityName: rawValue.personalDetails.nationality
      },
      applicationDetails: {
        ...rawValue.applicationDetails,
        track: rawValue.applicationDetails.track === 'Application' ? 0 : 1,
        admissionYear: parseInt(rawValue.applicationDetails.admissionYear) || 0
      },
      educationDetails: {
        undergraduate: {
          ...rawValue.educationDetails.undergraduate,
          countryId: '11111111-1111-1111-1111-111111111111', // TODO: Get from dropdown
          countryName: rawValue.educationDetails.undergraduate.country,
          languageId: 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', // TODO: Get from dropdown
          languageName: rawValue.educationDetails.undergraduate.language,
          graduationYear: parseInt(rawValue.educationDetails.undergraduate.graduationYear) || 0
        },
        secondDegree: rawValue.educationDetails.secondDegree.university ? {
          ...rawValue.educationDetails.secondDegree,
          countryId: '11111111-1111-1111-1111-111111111111',
          countryName: rawValue.educationDetails.secondDegree.country,
          languageId: 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
          languageName: rawValue.educationDetails.secondDegree.language,
          graduationYear: parseInt(rawValue.educationDetails.secondDegree.graduationYear) || 0
        } : undefined
      },
      englishQualifications: {
        ielts: rawValue.englishQualifications.ielts.score ? {
          name: 'IELTS',
          score: rawValue.englishQualifications.ielts.score,
          date: rawValue.englishQualifications.ielts.date
        } : undefined,
        toefl: rawValue.englishQualifications.toefl.score ? {
          name: 'TOEFL',
          score: rawValue.englishQualifications.toefl.score,
          date: rawValue.englishQualifications.toefl.date
        } : undefined,
        other: rawValue.englishQualifications.other.name ? {
          name: rawValue.englishQualifications.other.name,
          score: rawValue.englishQualifications.other.score,
          date: rawValue.englishQualifications.other.date
        } : undefined
      },
      employmentHistory: {
        position1: {
          ...rawValue.employmentHistory.position1,
          fromDate: rawValue.employmentHistory.position1.from,
          toDate: rawValue.employmentHistory.position1.to
        },
        position2: rawValue.employmentHistory.position2.organization ? {
          ...rawValue.employmentHistory.position2,
          fromDate: rawValue.employmentHistory.position2.from,
          toDate: rawValue.employmentHistory.position2.to
        } : undefined
      },
      declaration: rawValue.declaration
    };
  }

  closeDialog(): void {
    this.showDialog.set(false);
  }

  /**
   * Auto-format passport input: uppercase and remove special characters
   */
  formatPassportInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const oldLength = input.value.length;
    
    // Chuyển thành chữ hoa, loại bỏ ký tự đặc biệt
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Restore cursor position
    const newLength = input.value.length;
    const newPosition = cursorPosition - (oldLength - newLength);
    input.setSelectionRange(newPosition, newPosition);
    
    // Update form control value
    this.personalDetails.get('passportNo')?.setValue(input.value, { emitEvent: true });
  }

  /**
   * Auto-format email input: lowercase and trim spaces
   */
  formatEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Tự động lowercase và loại bỏ spaces
    input.value = input.value.toLowerCase().replace(/\s/g, '');
    
    // Update form control value
    this.personalDetails.get('email')?.setValue(input.value, { emitEvent: true });
  }

  ngOnInit(): void {
    // Setup conditional validation for IELTS
    this.setupConditionalValidation('ielts');
    
    // Setup conditional validation for TOEFL
    this.setupConditionalValidation('toefl');
    
    // Setup conditional validation for Other English test
    this.setupConditionalValidation('other');
  }

  /**
   * Setup conditional validation: if score is entered, date is required and vice versa
   */
  private setupConditionalValidation(testType: 'ielts' | 'toefl' | 'other'): void {
    const testGroup = this.englishQualifications.get(testType) as FormGroup;
    const scoreControl = testGroup.get('score');
    const dateControl = testGroup.get('date');

    // When score changes
    scoreControl?.valueChanges.subscribe(score => {
      if (score) {
        dateControl?.setValidators([Validators.required, maxDateValidator()]);
      } else {
        dateControl?.setValidators([maxDateValidator()]);
      }
      dateControl?.updateValueAndValidity({ emitEvent: false });
    });

    // When date changes
    dateControl?.valueChanges.subscribe(date => {
      if (date) {
        const validators = testType === 'ielts' 
          ? [Validators.required, scoreRangeValidator(0, 9)]
          : testType === 'toefl'
          ? [Validators.required, scoreRangeValidator(0, 120)]
          : [Validators.required];
        scoreControl?.setValidators(validators);
      } else {
        const validators = testType === 'ielts' 
          ? [scoreRangeValidator(0, 9)]
          : testType === 'toefl'
          ? [scoreRangeValidator(0, 120)]
          : [];
        scoreControl?.setValidators(validators);
      }
      scoreControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  // Helper to easily access nested form groups in the template
  get personalDetails() { return this.applicationForm.get('personalDetails') as FormGroup; }
  get applicationDetails() { return this.applicationForm.get('applicationDetails') as FormGroup; }
  get educationDetails() { return this.applicationForm.get('educationDetails') as FormGroup; }
  get englishQualifications() { return this.applicationForm.get('englishQualifications') as FormGroup; }
  get employmentHistory() { return this.applicationForm.get('employmentHistory') as FormGroup; }
  get declaration() { return this.applicationForm.get('declaration') as FormGroup; }
}
