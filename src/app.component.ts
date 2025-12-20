
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
import { atLeastOneEnglishQualificationValidator } from './validators/english-qualification.validator';

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
  programs = signal<any[]>([]);
  languages = signal<any[]>([]);
  countries = signal<any[]>([]);
  
  currentYear = new Date().getFullYear();
  
  applicationForm: FormGroup = this.fb.group({
    personalDetails: this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      nationalityId: ['', Validators.required],
      nationality: [''],
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
      programId: ['', Validators.required],
      programCode: [''],
      track: ['Application', Validators.required],
      admissionYear: ['', [Validators.required, minYearValidator(new Date().getFullYear())]],
      admissionIntake: ['', Validators.required],
    }),
    educationDetails: this.fb.group({
      undergraduate: this.fb.group({
        university: ['', Validators.required],
        countryId: ['', Validators.required],
        country: [''],
        major: ['', Validators.required],
        graduationYear: ['', [Validators.required, maxYearValidator(new Date().getFullYear())]],
        languageId: ['', Validators.required],
        language: [''],
      }),
      secondDegree: this.fb.group({
        university: [''],
        countryId: [''],
        country: [''],
        major: [''],
        graduationYear: [''],
        languageId: [''],
        language: [''],
      }),
      postgraduate: this.fb.group({
        university: [''],
        countryId: [''],
        country: [''],
        major: [''],
        graduationYear: [''],
        thesisTitle: [''],
        languageId: [''],
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
    }, { validators: atLeastOneEnglishQualificationValidator() }),
    employmentHistory: this.fb.group({
      position1: this.fb.group({
        organization: [''],
        title: [''],
        from: [''],
        to: [''],
        address: [''],
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
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.applicationForm);
    }
  }

  /**
   * Mark all fields in a form group as touched to trigger validation display
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
        nationalityId: rawValue.personalDetails.nationalityId,
        nationalityName: rawValue.personalDetails.nationality
      },
      applicationDetails: {
        programId: rawValue.applicationDetails.programId,
        track: rawValue.applicationDetails.track === 'Application' ? 0 : 1,
        admissionYear: parseInt(rawValue.applicationDetails.admissionYear) || 0,
        admissionIntake: rawValue.applicationDetails.admissionIntake
      },
      educationDetails: {
        undergraduate: {
          ...rawValue.educationDetails.undergraduate,
          countryId: rawValue.educationDetails.undergraduate.countryId,
          countryName: rawValue.educationDetails.undergraduate.country,
          languageId: rawValue.educationDetails.undergraduate.languageId,
          languageName: rawValue.educationDetails.undergraduate.language,
          graduationYear: parseInt(rawValue.educationDetails.undergraduate.graduationYear) || 0
        },
        secondDegree: rawValue.educationDetails.secondDegree.university ? {
          ...rawValue.educationDetails.secondDegree,
          countryId: rawValue.educationDetails.secondDegree.countryId || undefined,
          countryName: rawValue.educationDetails.secondDegree.country,
          languageId: rawValue.educationDetails.secondDegree.languageId || undefined,
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
        position1: rawValue.employmentHistory.position1.organization ? {
          ...rawValue.employmentHistory.position1,
          fromDate: rawValue.employmentHistory.position1.from,
          toDate: rawValue.employmentHistory.position1.to
        } : undefined,
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
    // Load programs
    this.loadPrograms();
    
    // Load languages
    this.loadLanguages();
    
    // Load countries
    this.loadCountries();
    
    // Setup conditional validation for IELTS
    this.setupConditionalValidation('ielts');
    
    // Setup conditional validation for TOEFL
    this.setupConditionalValidation('toefl');
    
    // Setup conditional validation for Other English test
    this.setupConditionalValidation('other');
  }

  /**
   * Load danh sách programs từ API
   */
  private loadPrograms(): void {
    this._mbaService.getActivePrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
      },
      error: (err) => {
        console.error('Error loading programs:', err);
      }
    });
  }

  /**
   * Load danh sách languages từ API
   */
  private loadLanguages(): void {
    this._mbaService.getActiveLanguages().subscribe({
      next: (languages) => {
        this.languages.set(languages);
      },
      error: (err) => {
        console.error('Error loading languages:', err);
      }
    });
  }

  /**
   * Load danh sách countries từ API
   */
  private loadCountries(): void {
    this._mbaService.getActiveCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }

  /**
   * Handle khi user chọn program từ dropdown
   */
  onProgramChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const programId = selectElement.value;
    
    if (programId) {
      const selectedProgram = this.programs().find(p => p.id === programId);
      if (selectedProgram) {
        this.applicationDetails.patchValue({
          programCode: selectedProgram.code
        });
      }
    } else {
      this.applicationDetails.patchValue({
        programCode: ''
      });
    }
  }

  /**
   * Handle khi user chọn nationality từ dropdown
   */
  onNationalityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nationalityId = selectElement.value;
    
    if (nationalityId) {
      const selectedCountry = this.countries().find(c => c.id === nationalityId);
      if (selectedCountry) {
        this.personalDetails.patchValue({
          nationality: selectedCountry.name
        });
      }
    } else {
      this.personalDetails.patchValue({
        nationality: ''
      });
    }
  }

  /**
   * Handle khi user chọn country từ dropdown (education)
   */
  onCountryChange(event: Event, section: 'undergraduate' | 'secondDegree' | 'postgraduate'): void {
    const selectElement = event.target as HTMLSelectElement;
    const countryId = selectElement.value;
    
    const sectionGroup = this.educationDetails.get(section) as FormGroup;
    
    if (countryId) {
      const selectedCountry = this.countries().find(c => c.id === countryId);
      if (selectedCountry) {
        sectionGroup.patchValue({
          country: selectedCountry.name
        });
      }
    } else {
      sectionGroup.patchValue({
        country: ''
      });
    }
  }

  /**
   * Handle khi user chọn language từ dropdown (undergraduate)
   */
  onLanguageChange(event: Event, section: 'undergraduate' | 'secondDegree' | 'postgraduate'): void {
    const selectElement = event.target as HTMLSelectElement;
    const languageId = selectElement.value;
    
    const sectionGroup = this.educationDetails.get(section) as FormGroup;
    
    if (languageId) {
      const selectedLanguage = this.languages().find(l => l.id === languageId);
      if (selectedLanguage) {
        sectionGroup.patchValue({
          language: selectedLanguage.name
        });
      }
    } else {
      sectionGroup.patchValue({
        language: ''
      });
    }
  }
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
