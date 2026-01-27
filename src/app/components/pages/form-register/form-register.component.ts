import { minAgeValidator } from '@/src/validators/age.validator';
import { completeRecordValidator } from '@/src/validators/complete-record.validator';
import { scoreRangeValidator } from '@/src/validators/conditional.validator';
import { dateRangeValidator, maxDateValidator, minDateYearValidator } from '@/src/validators/date.validator';
import { emailFormatValidator } from '@/src/validators/email-format.validator';
import { atLeastOneEnglishQualificationValidator, completeQualificationValidator } from '@/src/validators/english-qualification.validator';
import { passportFormatValidator } from '@/src/validators/passport-format.validator';
import { uniqueFieldValidator } from '@/src/validators/unique-field.validator';
import { maxYearValidator, minYearValidator } from '@/src/validators/year.validator';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { of, Subscription } from 'rxjs';
import { AlertService } from '../../../core/services/alert/alert.service';
import { MbaService } from '../../../core/services/mba/mba.service';

@Component({
  selector: 'app-form-register',
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxIntlTelInputModule, TranslatePipe]
})
export class FormRegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly _mbaService = inject(MbaService);
  private readonly _alertService = inject(AlertService);
  private readonly _router = inject(Router);
  private readonly _translate = inject(TranslateService);
  private readonly langChangeSub$: Subscription;

  loading = signal(false);
  submitting = signal(false);

  submitted = signal(false);
  showConfirmDialog = signal(false);
  programs = signal<any[]>([]);
  languages = signal<any[]>([]);
  countries = signal<any[]>([]);
  provinces = signal<any[]>([]); // Changed from cities to provinces
  correspondenceWards = signal<any[]>([]); // Changed from districts to wards
  permanentWards = signal<any[]>([]); // Changed from districts to wards

  currentYear = new Date().getFullYear();
  currentLanguage = 'vi';
  isLangVi: boolean = this.currentLanguage === 'vi';

  constructor() {
    // Subscribe to language change events
    this.currentLanguage = this._translate.getCurrentLang() || 'vi';
    this.langChangeSub$ = this._translate.onLangChange.subscribe((event) => {
      this.currentLanguage = event.lang;
      this.isLangVi = this.currentLanguage === 'vi';
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSub$) this.langChangeSub$.unsubscribe();
  }

  /**
   * Check if user has entered any meaningful data in the form
   * Ignores default values like gender
   */
  private hasUserEnteredData(): boolean {
    const personal = this.applicationForm.get('personalDetails')?.value;
    const education = this.applicationForm.get('educationDetails')?.value;
    const english = this.applicationForm.get('englishQualifications')?.value;
    const employment = this.applicationForm.get('employmentHistory')?.value;

    // Check personal details (excluding gender which has default)
    if (
      personal?.fullName ||
      personal?.dateOfBirth ||
      personal?.placeOfBirth ||
      personal?.passportNo ||
      personal?.email ||
      personal?.mobile ||
      personal?.jobTitle ||
      personal?.organization ||
      personal?.correspondenceAddress ||
      personal?.permanentAddress ||
      personal?.nationalityId
    ) {
      return true;
    }

    // Check education - first undergraduate
    const firstUg = education?.undergraduates?.[0];
    if (firstUg?.university || firstUg?.major || firstUg?.graduationYear) {
      return true;
    }

    // Check english qualifications
    if (english?.ielts?.score || english?.toefl?.score || english?.other?.name) {
      return true;
    }

    // Check employment
    if (employment?.position1?.organization || employment?.position2?.organization) {
      return true;
    }

    return false;
  }

  /**
   * Warn user before leaving page with unsaved changes (Create mode)
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    // Only warn if user has entered data AND not yet submitted
    if (this.hasUserEnteredData() && !this.submitted()) {
      event.preventDefault();
    }
  }

  applicationForm: FormGroup = this.fb.group({
    personalDetails: this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nationalityId: ['', Validators.required],
      nationality: [''],
      gender: ['Male', Validators.required],
      dateOfBirth: ['', [Validators.required, minAgeValidator(18), maxDateValidator(), minDateYearValidator(1900)]],
      placeOfBirth: ['', Validators.required],
      passportNo: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(12), passportFormatValidator()],
        [uniqueFieldValidator((val) => this._mbaService.checkPassportExists(val), 'passportExists')]
      ],
      dateIssued: ['', [Validators.required, maxDateValidator(), minDateYearValidator(1900)]],
      passportPlaceIssued: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, emailFormatValidator()]],
      mobile: [
        undefined,
        [Validators.required],
        [
          uniqueFieldValidator((val: any) => {
            // Extract e164Number from intl-tel-input object (format: +84845333577)
            const phoneNumber = val?.e164Number || val;
            if (!phoneNumber) return of(false);
            return this._mbaService.checkMobileExists(phoneNumber);
          }, 'mobileExists')
        ]
      ],
      jobTitle: ['', [Validators.required, Validators.maxLength(50)]],
      organization: ['', [Validators.required, Validators.maxLength(50)]],
      correspondenceCityId: [''],
      correspondenceCityName: [''],
      correspondenceDistrictId: [{ value: '', disabled: true }],
      correspondenceDistrictName: [''],
      correspondenceAddress: ['', [Validators.required, Validators.maxLength(50)]],
      permanentCityId: [''],
      permanentCityName: [''],
      permanentDistrictId: [{ value: '', disabled: true }],
      permanentDistrictName: [''],
      permanentAddress: ['', [Validators.required, Validators.maxLength(50)]],
      passportFile: [null]
    }),
    applicationDetails: this.fb.group({
      programId: [{ value: '', disabled: true }, Validators.required],
      programCode: [{ value: '', disabled: true }],
      programName: [''],
      track: [{ value: 'Application', disabled: true }, Validators.required],
      admissionYear: [this.currentYear, [Validators.required, minYearValidator(this.currentYear)]],
      admissionIntake: [{ value: '1' }, Validators.required]
    }),
    educationDetails: this.fb.group({
      undergraduates: this.fb.array([
        this.createUndergraduateGroup(), // First degree - required
        this.createOptionalUndergraduateGroup() // Second degree - optional
      ]),
      postgraduates: this.fb.array([this.createPostgraduateGroup()])
    }),
    englishQualifications: this.fb.group(
      {
        ielts: this.fb.group(
          {
            score: ['', [scoreRangeValidator(0, 9)]],
            date: ['', [maxDateValidator(), minDateYearValidator(1900)]]
          },
          { validators: completeQualificationValidator(['score', 'date']) }
        ),
        toefl: this.fb.group(
          {
            score: ['', [scoreRangeValidator(0, 120)]],
            date: ['', [maxDateValidator(), minDateYearValidator(1900)]]
          },
          { validators: completeQualificationValidator(['score', 'date']) }
        ),
        other: this.fb.group(
          {
            name: [''],
            score: [''],
            date: ['', [maxDateValidator(), minDateYearValidator(1900)]]
          },
          { validators: completeQualificationValidator(['name', 'score', 'date']) }
        ),
        certificateFile: [null] // File upload for all English qualifications
      },
      { validators: atLeastOneEnglishQualificationValidator() }
    ),
    employmentHistory: this.fb.group({
      totalExpYears: ['', Validators.required],
      totalExpMonths: ['', Validators.required],
      position1: this.fb.group(
        {
          organization: ['', Validators.maxLength(50)],
          title: ['', Validators.maxLength(50)],
          from: ['', [minDateYearValidator(1900)]],
          to: ['', [minDateYearValidator(1900)]],
          address: ['', Validators.maxLength(50)]
        },
        { validators: [dateRangeValidator('from', 'to'), completeRecordValidator(['organization', 'title', 'from', 'to', 'address'])] }
      ),
      position2: this.fb.group(
        {
          organization: ['', Validators.maxLength(50)],
          title: ['', Validators.maxLength(50)],
          from: ['', [minDateYearValidator(1900)]],
          to: ['', [minDateYearValidator(1900)]],
          address: ['', Validators.maxLength(50)]
        },
        { validators: [dateRangeValidator('from', 'to'), completeRecordValidator(['organization', 'title', 'from', 'to', 'address'])] }
      )
    }),
    declaration: this.fb.group({
      agreed: [false, Validators.requiredTrue]
    })
  });

  submitForm(): void {
    this.submitted.set(true);

    if (this.applicationForm.valid) {
      // Show confirm dialog
      this.showConfirmDialog.set(true);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.applicationForm);
    }
  }

  /**
   * Handle confirm Submit
   */
  confirmSubmit(): void {
    this.showConfirmDialog.set(false);
    this.submitting.set(true);

    // Transform form data to match API structure
    const formData = this.transformFormData();

    this._mbaService.add(formData).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this._alertService.success(
            this._translate.instant('SUBMIT_RESULT.SUCCESS_TITLE'),
            this._translate.instant('SUBMIT_RESULT.SUCCESS_MESSAGE'),
            3000
          );
          // Reset form after successful submission
          this.applicationForm.reset();
          this.submitted.set(false);

          // Navigate to login page after 3 seconds
          setTimeout(() => {
            this._router.navigate(['/login']);
          }, 3000);
        } else {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            res.message || this._translate.instant('SUBMIT_RESULT.ERROR_MESSAGE')
          );
        }
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Submit error:', err);
        this._alertService.error(
          this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
          this._translate.instant('SUBMIT_RESULT.SYSTEM_ERROR')
        );
      }
    });
  }

  /**
   * Handle confirm No - Keep form as is
   */
  cancelSubmit(): void {
    this.showConfirmDialog.set(false);
  }

  /**
   * Mark all fields in a form group as touched to trigger validation display
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  /**
   * Check if a field should show error styling
   */
  isFieldInvalid(controlPath: string): boolean {
    const control = this.applicationForm.get(controlPath);
    return !!(control && control.invalid && (control.touched || this.submitted()));
  }

  /**
   * Get CSS classes for input field based on validation state
   */
  getFieldClasses(
    controlPath: string,
    baseClasses: string = 'mt-1 block w-full rounded-md shadow-sm px-3 py-2'
  ): string {
    const control = this.applicationForm.get(controlPath);
    const isInvalid = control && control.invalid && (control.touched || this.submitted());

    if (isInvalid) {
      return `${baseClasses} border-2 border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return `${baseClasses} border-gray-300 focus:border-[#a68557] focus:ring-[#a68557]`;
  }

  private transformFormData(): FormData {
    const rawValue = this.applicationForm.getRawValue();
    const formData = new FormData();

    this.appendPersonalDetails(formData, rawValue);
    this.appendApplicationDetails(formData, rawValue);
    this.appendEducationDetails(formData, rawValue);
    this.appendEnglishQualifications(formData, rawValue);
    this.appendEmploymentHistory(formData, rawValue);
    this.appendDeclaration(formData, rawValue);

    return formData;
  }

  private appendPersonalDetails(formData: FormData, rawValue: any): void {
    const language = localStorage.getItem('lang') || 'en';
    formData.append('Language', language);

    const personal = rawValue.personalDetails;
    formData.append('PersonalDetails.FullName', personal.fullName || '');
    formData.append('PersonalDetails.NationalityId', personal.nationalityId || '');
    formData.append('PersonalDetails.Gender', personal.gender === 'Male' ? '1' : '2');
    formData.append('PersonalDetails.DateOfBirth', personal.dateOfBirth || '');
    formData.append('PersonalDetails.PlaceOfBirth', personal.placeOfBirth || '');
    formData.append('PersonalDetails.PassportNo', personal.passportNo?.trim().toUpperCase() || '');
    formData.append('PersonalDetails.DateIssued', personal.dateIssued || '');
    formData.append('PersonalDetails.PassportPlaceIssued', personal.passportPlaceIssued || '');
    formData.append('PersonalDetails.Email', personal.email?.trim().toLowerCase() || '');

    const mobile = personal.mobile?.e164Number || personal.mobile || '';
    formData.append('PersonalDetails.Mobile', mobile);

    if (personal.jobTitle) {
      formData.append('PersonalDetails.JobTitle', personal.jobTitle);
    }
    if (personal.organization) {
      formData.append('PersonalDetails.Organization', personal.organization);
    }

    this.appendAddressDetails(formData, personal, 'Correspondence');
    this.appendAddressDetails(formData, personal, 'Permanent');
    this.appendFiles(formData, personal.passportFile, 'PersonalDetails.Files');
  }

  private appendAddressDetails(formData: FormData, personal: any, type: 'Correspondence' | 'Permanent'): void {
    const districtIdKey = `${type.toLowerCase()}DistrictId`;
    const addressKey = `${type.toLowerCase()}Address`;
    const wardsArray = type === 'Correspondence' ? this.correspondenceWards() : this.permanentWards();

    if (personal[districtIdKey]) {
      const ward = wardsArray.find((w) => w.wardCode === personal[districtIdKey]);
      if (ward?.id) {
        formData.append(`PersonalDetails.${type}CityId`, ward.id.toString());
      }
    }
    if (personal[addressKey]) {
      formData.append(`PersonalDetails.${type}Address`, personal[addressKey]);
    }
  }

  private appendApplicationDetails(formData: FormData, rawValue: any): void {
    const app = rawValue.applicationDetails;
    formData.append('ApplicationDetails.ProgramId', this.applicationDetails.get('programId')?.value || '');
    formData.append('ApplicationDetails.Track', '0');
    formData.append('ApplicationDetails.AdmissionYear', app.admissionYear?.toString() || '');
    formData.append('ApplicationDetails.AdmissionIntake', app.admissionIntake || '');
  }

  private appendEducationDetails(formData: FormData, rawValue: any): void {
    const education = rawValue.educationDetails;

    const undergraduates = education.undergraduates.filter((ug: any) => ug.university);
    undergraduates.forEach((ug: any, index: number) => {
      this.appendDegreeData(formData, ug, index, 'Undergraduates');
    });

    const postgraduates = education.postgraduates.filter((pg: any) => pg.university);
    postgraduates.forEach((pg: any, index: number) => {
      this.appendDegreeData(formData, pg, index, 'Postgraduates');
      if (pg.thesisTitle) {
        formData.append(`EducationDetails.Postgraduates[${index}].ThesisTitle`, pg.thesisTitle);
      }
    });
  }

  private appendDegreeData(
    formData: FormData,
    degree: any,
    index: number,
    degreeType: 'Undergraduates' | 'Postgraduates'
  ): void {
    formData.append(`EducationDetails.${degreeType}[${index}].University`, degree.university || '');
    formData.append(`EducationDetails.${degreeType}[${index}].CountryId`, degree.countryId || '');
    formData.append(`EducationDetails.${degreeType}[${index}].Major`, degree.major || '');
    formData.append(`EducationDetails.${degreeType}[${index}].GraduationYear`, degree.graduationYear?.toString() || '');
    formData.append(`EducationDetails.${degreeType}[${index}].LanguageId`, degree.languageId || '');
    formData.append(`EducationDetails.${degreeType}[${index}].SortOrder`, index.toString());

    if (degreeType === 'Undergraduates') {
      formData.append(`EducationDetails.${degreeType}[${index}].Gpa`, degree.gpa || '');
      formData.append(`EducationDetails.${degreeType}[${index}].GraduationRank`, degree.graduationRank || '');
    }

    this.appendFiles(formData, degree.file, `EducationDetails.${degreeType}[${index}].Files`);
  }

  private appendEnglishQualifications(formData: FormData, rawValue: any): void {
    const english = rawValue.englishQualifications;

    this.appendEnglishTest(formData, english.ielts, 'Ielts');
    this.appendEnglishTest(formData, english.toefl, 'Toefl');

    if (english.other.name) {
      formData.append('EnglishQualifications.Other.Name', english.other.name);
      formData.append('EnglishQualifications.Other.Score', english.other.score || '');
      if (english.other.date) {
        formData.append('EnglishQualifications.Other.Date', english.other.date);
      }
    }

    this.appendFiles(formData, english.certificateFile, 'EnglishQualifications.Files');
  }

  private appendEnglishTest(formData: FormData, test: any, testName: 'Ielts' | 'Toefl'): void {
    if (test.score) {
      formData.append(`EnglishQualifications.${testName}.Score`, test.score);
      if (test.date) {
        formData.append(`EnglishQualifications.${testName}.Date`, test.date);
      }
    }
  }

  private appendEmploymentHistory(formData: FormData, rawValue: any): void {
    const employment = rawValue.employmentHistory;

    if (employment.totalExpYears !== null && employment.totalExpYears !== undefined && employment.totalExpYears !== '') {
      formData.append('EmploymentHistory.TotalExpYears', employment.totalExpYears);
    }
    if (employment.totalExpMonths !== null && employment.totalExpMonths !== undefined && employment.totalExpMonths !== '') {
      formData.append('EmploymentHistory.TotalExpMonths', employment.totalExpMonths);
    }

    this.appendEmploymentPosition(formData, employment.position1, 'Position1');
    this.appendEmploymentPosition(formData, employment.position2, 'Position2');
  }

  private appendEmploymentPosition(formData: FormData, position: any, positionName: 'Position1' | 'Position2'): void {
    if (position.organization) {
      formData.append(`EmploymentHistory.${positionName}.OrganizationName`, position.organization);
      formData.append(`EmploymentHistory.${positionName}.JobTitle`, position.title || '');
      formData.append(`EmploymentHistory.${positionName}.FromDate`, position.from || '');
      if (position.to) {
        formData.append(`EmploymentHistory.${positionName}.ToDate`, position.to);
      }
      if (position.address) {
        formData.append(`EmploymentHistory.${positionName}.Address`, position.address);
      }
    }
  }

  private appendDeclaration(formData: FormData, rawValue: any): void {
    formData.append('Declaration.agreed', rawValue.declaration.agreed.toString());
    if (rawValue.declaration.agreed) {
      formData.append('Declaration.AcceptedDate', new Date().toISOString().split('T')[0]);
    }
  }

  private appendFiles(formData: FormData, files: any, fieldName: string): void {
    const fileArray = files || [];
    if (Array.isArray(fileArray)) {
      fileArray.forEach((file: File) => {
        formData.append(fieldName, file);
      });
    }
  }

  /**
   * Auto-format passport input: uppercase and remove special characters
   */
  formatPassportInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const oldLength = input.value.length;

    // Convert to uppercase, remove special characters
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
    // Auto lowercase and remove spaces
    input.value = input.value.toLowerCase().replace(/\s/g, '');

    // Update form control value
    this.personalDetails.get('email')?.setValue(input.value, { emitEvent: true });
  }

  ngOnInit(): void {
    this.currentLanguage = localStorage.getItem('lang') || 'vi';
    this.isLangVi = this.currentLanguage === 'vi';

    // Load programs
    this.loadPrograms();

    // Load languages
    this.loadLanguages();

    // Load countries
    this.loadCountries();

    // Load provinces (cities)
    this.loadProvinces();

    // Setup conditional validation for IELTS
    this.setupConditionalValidation('ielts');

    // Setup conditional validation for TOEFL
    this.setupConditionalValidation('toefl');

    // Setup conditional validation for Other English test
    this.setupConditionalValidation('other');
  }

  /**
   * Load list of programs from API
   */
  private loadPrograms(): void {
    this._mbaService.getActivePrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);

        // Auto-select MBA program if available
        const mbaProgram = programs.find((p) => p.code === '8340101');
        if (mbaProgram) {
          // Use setValue to update disabled control
          this.applicationDetails.get('programId')?.setValue(mbaProgram.id);
          this.applicationDetails.patchValue({
            programCode: mbaProgram.code,
            programName: this.isLangVi ? mbaProgram.name : mbaProgram.name_EN,
            admissionIntake: '1' // Default intake
          });
          // Reset dirty state after auto-select (user hasn't actually changed anything)
          this.applicationForm.markAsPristine();
        }
      },
      error: (err) => {
        console.error('Error loading programs:', err);
      }
    });
  }

  /**
   * Load list of languages from API
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
   * Load list of countries from API
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
   * Load list of provinces from API
   */
  private loadProvinces(): void {
    this._mbaService.getProvinces().subscribe({
      next: (provinces) => {
        this.provinces.set(provinces);
      },
      error: (err) => {
        console.error('Error loading provinces:', err);
      }
    });
  }

  /**
   * Handle when user selects program from dropdown
   */
  onProgramChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const programId = selectElement.value;

    if (programId) {
      const selectedProgram = this.programs().find((p) => p.id === programId);
      if (selectedProgram) {
        this.applicationDetails.patchValue({
          programCode: selectedProgram.code,
          programName: selectedProgram.name
        });
      }
    } else {
      this.applicationDetails.patchValue({
        programCode: '',
        programName: ''
      });
    }
  }

  /**
   * Handle when user selects nationality from dropdown
   */
  onNationalityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nationalityId = selectElement.value;

    if (nationalityId) {
      const selectedCountry = this.countries().find((c) => c.id === nationalityId);
      if (selectedCountry) {
        this.personalDetails.patchValue({
          nationality: selectedCountry.name
        });

        // Reset city fields when nationality changes
        this.personalDetails.patchValue({
          correspondenceCityId: '',
          correspondenceCityName: '',
          permanentCityId: '',
          permanentCityName: ''
        });
      }
    } else {
      this.personalDetails.patchValue({
        nationality: ''
      });
    }
  }

  /**
   * Handle when user selects country from dropdown (education)
   */
  onCountryChange(event: Event, section: 'undergraduates' | 'postgraduates', index?: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const countryId = selectElement.value;

    let sectionGroup: FormGroup;

    if (section === 'undergraduates' && index !== undefined) {
      sectionGroup = this.undergraduates.at(index) as FormGroup;
    } else if (section === 'postgraduates' && index !== undefined) {
      sectionGroup = this.postgraduates.at(index) as FormGroup;
    } else {
      return;
    }

    if (countryId) {
      const selectedCountry = this.countries().find((c) => c.id === countryId);
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
   * Handle when user selects correspondence province from dropdown
   */
  onCorrespondenceCityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const provinceCode = selectElement.value;

    if (provinceCode) {
      const selectedProvince = this.provinces().find((p) => p.provinceCode === provinceCode);
      if (selectedProvince) {
        this.personalDetails.patchValue({
          correspondenceCityName: selectedProvince.provinceName
        });
      }

      // Enable ward dropdown
      this.personalDetails.get('correspondenceDistrictId')?.enable();

      // Load wards for selected province
      this._mbaService.getWardsByProvinceCode(provinceCode).subscribe({
        next: (wards) => {
          this.correspondenceWards.set(wards);
          // Reset ward selection
          this.personalDetails.patchValue({
            correspondenceDistrictId: '',
            correspondenceDistrictName: ''
          });
        },
        error: (err) => {
          console.error('Error loading correspondence wards:', err);
          this.correspondenceWards.set([]);
        }
      });
    } else {
      // Disable ward dropdown when no province selected
      this.personalDetails.get('correspondenceDistrictId')?.disable();
      this.personalDetails.patchValue({
        correspondenceCityName: '',
        correspondenceDistrictId: '',
        correspondenceDistrictName: ''
      });
      this.correspondenceWards.set([]);
    }
  }

  /**
   * Handle when user selects correspondence ward from dropdown
   */
  onCorrespondenceDistrictChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const wardCode = selectElement.value;

    if (wardCode) {
      const selectedWard = this.correspondenceWards().find((w) => w.wardCode === wardCode);
      if (selectedWard) {
        this.personalDetails.patchValue({
          correspondenceDistrictName: selectedWard.wardName
        });
      }
    } else {
      this.personalDetails.patchValue({
        correspondenceDistrictName: ''
      });
    }
  }

  /**
   * Handle when user selects permanent province from dropdown
   */
  onPermanentCityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const provinceCode = selectElement.value;

    if (provinceCode) {
      const selectedProvince = this.provinces().find((p) => p.provinceCode === provinceCode);
      if (selectedProvince) {
        this.personalDetails.patchValue({
          permanentCityName: selectedProvince.provinceName
        });
      }

      // Enable ward dropdown
      this.personalDetails.get('permanentDistrictId')?.enable();

      // Load wards for selected province
      this._mbaService.getWardsByProvinceCode(provinceCode).subscribe({
        next: (wards) => {
          this.permanentWards.set(wards);
          // Reset ward selection
          this.personalDetails.patchValue({
            permanentDistrictId: '',
            permanentDistrictName: ''
          });
        },
        error: (err) => {
          console.error('Error loading permanent wards:', err);
          this.permanentWards.set([]);
        }
      });
    } else {
      // Disable ward dropdown when no province selected
      this.personalDetails.get('permanentDistrictId')?.disable();
      this.personalDetails.patchValue({
        permanentCityName: '',
        permanentDistrictId: '',
        permanentDistrictName: ''
      });
      this.permanentWards.set([]);
    }
  }

  /**
   * Handle when user selects permanent ward from dropdown
   */
  onPermanentDistrictChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const wardCode = selectElement.value;

    if (wardCode) {
      const selectedWard = this.permanentWards().find((w) => w.wardCode === wardCode);
      if (selectedWard) {
        this.personalDetails.patchValue({
          permanentDistrictName: selectedWard.wardName
        });
      }
    } else {
      this.personalDetails.patchValue({
        permanentDistrictName: ''
      });
    }
  }

  /**
   * Handle passport file upload - Multiple files
   */
  onPassportFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        // Validate file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name}: File size must be less than 5MB`);
          continue;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Only PDF, JPG, and PNG files are allowed`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        alert('Some files were rejected:\n\n' + errors.join('\n'));
      }

      if (validFiles.length > 0) {
        // Merge with existing files
        const existingFiles = this.personalDetails.get('passportFile')?.value || [];
        const allFiles = [...existingFiles, ...validFiles];
        this.personalDetails.patchValue({ passportFile: allFiles });
      }

      // Reset input to allow selecting the same file again
      input.value = '';
    }
  }

  /**
   * Remove a specific passport file
   */
  removePassportFile(index: number): void {
    const files = this.personalDetails.get('passportFile')?.value || [];
    if (files.length > 0) {
      const updatedFiles = files.filter((_: any, i: number) => i !== index);
      this.personalDetails.patchValue({
        passportFile: updatedFiles.length > 0 ? updatedFiles : null
      });
    }
  }

  /**
   * Get file name from File object
   */
  getFileName(file: any): string {
    return file?.name || 'Unknown file';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Create undergraduate form group (required fields)
   */
  private createUndergraduateGroup(): FormGroup {
    return this.fb.group({
      university: ['', Validators.required],
      countryId: ['', Validators.required],
      country: [''],
      major: ['', Validators.required],
      graduationYear: ['', [Validators.required, minYearValidator(1950), maxYearValidator(new Date().getFullYear())]],
      gpa: ['', Validators.required],
      graduationRank: ['', Validators.required],
      languageId: ['', Validators.required],
      language: [''],
      file: [null]
    });
  }

  /**
   * Create optional undergraduate form group (no required fields)
   */
  private createOptionalUndergraduateGroup(): FormGroup {
    return this.fb.group(
      {
        university: [''],
        countryId: [''],
        country: [''],
        major: [''],
        graduationYear: ['', [minYearValidator(1950), maxYearValidator(new Date().getFullYear())]],
        gpa: [''],
        graduationRank: [''],
        languageId: [''],
        language: [''],
        file: [null]
      },
      {
        validators: completeRecordValidator([
          'university',
          'countryId',
          'major',
          'graduationYear',
          'gpa',
          'graduationRank',
          'languageId'
        ])
      }
    );
  }

  /**
   * Create postgraduate form group
   */
  private createPostgraduateGroup(): FormGroup {
    return this.fb.group(
      {
        university: [''],
        countryId: [''],
        country: [''],
        major: [''],
        graduationYear: ['', [minYearValidator(1950), maxYearValidator(new Date().getFullYear())]],
        thesisTitle: [''],
        languageId: [''],
        language: [''],
        file: [null]
      },
      {
        validators: completeRecordValidator(['university', 'countryId', 'major', 'graduationYear', 'languageId'])
      }
    );
  }

  /**
   * Get undergraduates FormArray
   */
  get undergraduates(): FormArray {
    return this.educationDetails.get('undergraduates') as FormArray;
  }

  /**
   * Get postgraduates FormArray
   */
  get postgraduates(): FormArray {
    return this.educationDetails.get('postgraduates') as FormArray;
  }

  /**
   * Add new undergraduate section (optional)
   */
  addUndergraduate(): void {
    this.undergraduates.push(this.createOptionalUndergraduateGroup());
  }

  /**
   * Remove undergraduate section
   */
  removeUndergraduate(index: number): void {
    if (this.undergraduates.length > 2) {
      this.undergraduates.removeAt(index);
    }
  }

  /**
   * Add new postgraduate section
   */
  addPostgraduate(): void {
    this.postgraduates.push(this.createPostgraduateGroup());
  }

  /**
   * Remove postgraduate section
   */
  removePostgraduate(index: number): void {
    if (this.postgraduates.length > 1) {
      this.postgraduates.removeAt(index);
    }
  }


  /**
   * Handle education file upload - Multiple files
   */
  onEducationFileChange(event: Event, section: 'undergraduates' | 'postgraduates', index?: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      for (const file of files) {
        // Validate file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_SIZE_LIMIT')}`
          );
          continue;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_INVALID_TYPE')}`
          );
          continue;
        }

        this.updateEducationFiles(section, index, [file]);
      }

      // Reset input to allow selecting the same file again
      input.value = '';
    }
  }

  /**
   * Update education files for the specified section
   */
  private updateEducationFiles(
    section: 'undergraduates' | 'postgraduates',
    index: number | undefined,
    validFiles: File[]
  ): void {
    if (section === 'undergraduates' && index !== undefined) {
      const existingFiles = this.undergraduates.at(index).get('file')?.value || [];
      const allFiles = [...existingFiles, ...validFiles];
      this.undergraduates.at(index).patchValue({ file: allFiles });
    } else if (section === 'postgraduates' && index !== undefined) {
      const existingFiles = this.postgraduates.at(index).get('file')?.value || [];
      const allFiles = [...existingFiles, ...validFiles];
      this.postgraduates.at(index).patchValue({ file: allFiles });
    }
  }

  /**
   * Remove a specific education file
   */
  removeEducationFile(section: 'undergraduates' | 'postgraduates', fileIndex: number, arrayIndex?: number): void {
    let files: File[] = [];

    if (section === 'undergraduates' && arrayIndex !== undefined) {
      files = this.undergraduates.at(arrayIndex).get('file')?.value || [];
      const updatedFiles = files.filter((_, i) => i !== fileIndex);
      this.undergraduates.at(arrayIndex).patchValue({ file: updatedFiles.length > 0 ? updatedFiles : null });
    } else if (section === 'postgraduates' && arrayIndex !== undefined) {
      files = this.postgraduates.at(arrayIndex).get('file')?.value || [];
      const updatedFiles = files.filter((_, i) => i !== fileIndex);
      this.postgraduates.at(arrayIndex).patchValue({ file: updatedFiles.length > 0 ? updatedFiles : null });
    }
  }

  /**
   * Handle English certificate file upload - Multiple files
   */
  onEnglishCertificateFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      for (const file of files) {
        // Validate file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_SIZE_LIMIT')}`
          );
          continue;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_INVALID_TYPE')}`
          );
          continue;
        }

        // Merge with existing files
        const existingFiles = this.englishQualifications.get('certificateFile')?.value || [];
        const allFiles = [...existingFiles, file];
        this.englishQualifications.patchValue({ certificateFile: allFiles });
      }

      // Reset input to allow selecting the same file again
      input.value = '';
    }
  }

  /**
   * Remove a specific English certificate file
   */
  removeEnglishCertificateFile(index: number): void {
    const files = this.englishQualifications.get('certificateFile')?.value || [];
    if (files.length > 0) {
      const updatedFiles = files.filter((_: any, i: number) => i !== index);
      this.englishQualifications.patchValue({
        certificateFile: updatedFiles.length > 0 ? updatedFiles : null
      });
    }
  }

  /**
   * Handle when user selects language from dropdown (undergraduate)
   */
  onLanguageChange(event: Event, section: 'undergraduates' | 'postgraduates', index?: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const languageId = selectElement.value;

    let sectionGroup: FormGroup;

    if (section === 'undergraduates' && index !== undefined) {
      sectionGroup = this.undergraduates.at(index) as FormGroup;
    } else if (section === 'postgraduates' && index !== undefined) {
      sectionGroup = this.postgraduates.at(index) as FormGroup;
    } else {
      return;
    }

    if (languageId) {
      const selectedLanguage = this.languages().find((l) => l.id === languageId);
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

  private getScoreValidators(testType: 'ielts' | 'toefl' | 'other', includeRequired: boolean): any[] {
    if (testType === 'ielts') {
      return includeRequired ? [Validators.required, scoreRangeValidator(0, 9)] : [scoreRangeValidator(0, 9)];
    } else if (testType === 'toefl') {
      return includeRequired ? [Validators.required, scoreRangeValidator(0, 120)] : [scoreRangeValidator(0, 120)];
    } else {
      return includeRequired ? [Validators.required] : [];
    }
  }

  private setupConditionalValidation(testType: 'ielts' | 'toefl' | 'other'): void {
    const testGroup = this.englishQualifications.get(testType) as FormGroup;
    const scoreControl = testGroup.get('score');
    const dateControl = testGroup.get('date');

    // When score changes
    scoreControl?.valueChanges.subscribe((score) => {
      if (score) {
        dateControl?.setValidators([Validators.required, maxDateValidator()]);
      } else {
        dateControl?.setValidators([maxDateValidator()]);
      }
      dateControl?.updateValueAndValidity({ emitEvent: false });
    });

    // When date changes
    dateControl?.valueChanges.subscribe((date) => {
      if (date) {
        const validators = this.getScoreValidators(testType, true);
        scoreControl?.setValidators(validators);
      } else {
        const validators = this.getScoreValidators(testType, false);
        scoreControl?.setValidators(validators);
      }
      scoreControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  // Helper to easily access nested form groups in the template
  get personalDetails() {
    return this.applicationForm.get('personalDetails') as FormGroup;
  }
  get applicationDetails() {
    return this.applicationForm.get('applicationDetails') as FormGroup;
  }
  get educationDetails() {
    return this.applicationForm.get('educationDetails') as FormGroup;
  }
  get englishQualifications() {
    return this.applicationForm.get('englishQualifications') as FormGroup;
  }
  get employmentHistory() {
    return this.applicationForm.get('employmentHistory') as FormGroup;
  }
  get declaration() {
    return this.applicationForm.get('declaration') as FormGroup;
  }
}
