
import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { of } from 'rxjs';
import { MbaService } from './app/core/services/mba/mba.service';
import { AlertService } from './app/core/services/alert/alert.service';
import { PageLayoutComponent } from './app/components/layouts/page-layout/page-layout.component';
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
  imports: [ReactiveFormsModule, CommonModule, NgxIntlTelInputModule, PageLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppComponent implements OnInit {
  private fb = inject(FormBuilder);
  private readonly _mbaService = inject(MbaService);
  private readonly _alertService = inject(AlertService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  
  loading = signal(false);
  
  submitted = signal(false);
  showConfirmDialog = signal(false);
  programs = signal<any[]>([]);
  languages = signal<any[]>([]);
  countries = signal<any[]>([]);
  cities = signal<any[]>([]);
  correspondenceDistricts = signal<any[]>([]);
  permanentDistricts = signal<any[]>([]);
  
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
      jobTitle: ['', Validators.required],
      organization: ['', Validators.required],
      correspondenceCityId: [''],
      correspondenceCityName: [''],
      correspondenceDistrictId: [{ value: '', disabled: true }],
      correspondenceDistrictName: [''],
      correspondenceAddress: ['', Validators.required],
      permanentCityId: [''],
      permanentCityName: [''],
      permanentDistrictId: [{ value: '', disabled: true }],
      permanentDistrictName: [''],
      permanentAddress: ['', Validators.required],
      passportFile: [null],
    }),
    applicationDetails: this.fb.group({
      programId: [{ value: '', disabled: true }, Validators.required],
      programCode: [{ value: '', disabled: true }],
      programName: [''],
      track: [{ value: 'Application', disabled: true }, Validators.required],
      admissionYear: [{ value: this.currentYear + 1, disabled: true }, [Validators.required, minYearValidator(this.currentYear)]],
      admissionIntake: [{ value: '1', disabled: true }, Validators.required],
    }),
    educationDetails: this.fb.group({
      undergraduates: this.fb.array([
        this.createUndergraduateGroup(), // First degree - required
        this.createOptionalUndergraduateGroup() // Second degree - optional
      ]),
      postgraduates: this.fb.array([this.createPostgraduateGroup()]),
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
      certificateFile: [null], // File upload for all English qualifications
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
    
    // Transform form data to match API structure
    const formData = this.transformFormData();
    
    this._mbaService.add(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this._alertService.success('Success!', 'Application submitted successfully! Redirecting to login...', 3000);
          // Reset form after successful submission
          this.applicationForm.reset();
          this.submitted.set(false);
          
          // Navigate to login page after 3 seconds
          setTimeout(() => {
            this._router.navigate(['/login']);
          }, 3000);
        } else {
          this._alertService.error('Error', res.message || 'Failed to submit application');
        }
      },
      error: (err) => {
        console.error('Submit error:', err);
        this._alertService.error('Error', 'An error occurred while submitting the application');
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
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
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
  getFieldClasses(controlPath: string, baseClasses: string = 'mt-1 block w-full rounded-md shadow-sm px-3 py-2'): string {
    const control = this.applicationForm.get(controlPath);
    const isInvalid = control && control.invalid && (control.touched || this.submitted());
    
    if (isInvalid) {
      return `${baseClasses} border-2 border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return `${baseClasses} border-gray-300 focus:border-[#a68557] focus:ring-[#a68557]`;
  }

  private transformFormData(): any {
    const rawValue = this.applicationForm.getRawValue();
    
    // Helper function to merge address components
    const mergeAddress = (cityName: string, districtName: string, address: string): string => {
      const parts: string[] = [];
      if (address) parts.push(address);
      if (districtName) parts.push(districtName);
      if (cityName) parts.push(cityName);
      return parts.join(', ');
    };
    
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
        nationalityName: rawValue.personalDetails.nationality,
        // Merge correspondence address components into single field
        correspondenceAddress: mergeAddress(
          rawValue.personalDetails.correspondenceCityName,
          rawValue.personalDetails.correspondenceDistrictName,
          rawValue.personalDetails.correspondenceAddress
        ),
        // Merge permanent address components into single field
        permanentAddress: mergeAddress(
          rawValue.personalDetails.permanentCityName,
          rawValue.personalDetails.permanentDistrictName,
          rawValue.personalDetails.permanentAddress
        ),
        passportFile: rawValue.personalDetails.passportFile || undefined
      },
      applicationDetails: {
        programId: this.applicationDetails.get('programId')?.value || '', // Get from disabled control
        programName: rawValue.applicationDetails.programName,
        programCode: rawValue.applicationDetails.programCode,
        track: 0, // Always Application
        admissionYear: parseInt(rawValue.applicationDetails.admissionYear) || 0,
        admissionIntake: '1' // Always 1, hardcoded
      },
      educationDetails: {
        undergraduates: rawValue.educationDetails.undergraduates
          .filter((ug: any) => ug.university) // Only include if university is filled
          .map((ug: any, index: number) => ({
            university: ug.university,
            countryId: ug.countryId,
            countryName: ug.country,
            major: ug.major,
            graduationYear: parseInt(ug.graduationYear) || 0,
            languageId: ug.languageId,
            languageName: ug.language,
            sortOrder: index,
            file: ug.file || undefined
          })),
        postgraduates: rawValue.educationDetails.postgraduates
          .filter((pg: any) => pg.university) // Only include if university is filled
          .map((pg: any, index: number) => ({
            university: pg.university,
            countryId: pg.countryId,
            countryName: pg.country,
            major: pg.major,
            graduationYear: parseInt(pg.graduationYear) || 0,
            thesisTitle: pg.thesisTitle,
            languageId: pg.languageId,
            languageName: pg.language,
            sortOrder: index,
            file: pg.file || undefined
          }))
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
          organizationName: rawValue.employmentHistory.position1.organization,
          jobTitle: rawValue.employmentHistory.position1.title,
          fromDate: rawValue.employmentHistory.position1.from,
          toDate: rawValue.employmentHistory.position1.to,
          address: rawValue.employmentHistory.position1.address
        } : undefined,
        position2: rawValue.employmentHistory.position2.organization ? {
          organizationName: rawValue.employmentHistory.position2.organization,
          jobTitle: rawValue.employmentHistory.position2.title,
          fromDate: rawValue.employmentHistory.position2.from,
          toDate: rawValue.employmentHistory.position2.to,
          address: rawValue.employmentHistory.position2.address
        } : undefined
      },
      declaration: rawValue.declaration
    };
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
    
    // Load cities
    this.loadCities();
    
    // Setup conditional validation for IELTS
    this.setupConditionalValidation('ielts');
    
    // Setup conditional validation for TOEFL
    this.setupConditionalValidation('toefl');
    
    // Setup conditional validation for Other English test
    this.setupConditionalValidation('other');
    
    // Setup beforeunload warning
    this.setupBeforeUnloadWarning();
  }

  /**
   * Setup warning when user tries to reload or close tab with unsaved changes
   */
  private setupBeforeUnloadWarning(): void {
    window.addEventListener('beforeunload', (event) => {
      // Check if form has been touched (has any data)
      if (this.applicationForm.dirty && !this.submitted()) {
        // Standard way to show confirmation dialog
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = '';
        return '';
      }
      return undefined;
    });
  }

  /**
   * Load danh sách programs từ API
   */
  private loadPrograms(): void {
    this._mbaService.getActivePrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        
        // Auto-select MBA program if available
        const mbaProgram = programs.find(p => p.code === 'MBA' || p.name.includes('Master of Business Administration'));
        if (mbaProgram) {
          // Use setValue to update disabled control
          this.applicationDetails.get('programId')?.setValue(mbaProgram.id);
          this.applicationDetails.patchValue({
            programCode: mbaProgram.code,
            programName: mbaProgram.name
          });
        }
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
   * Load danh sách cities từ API
   */
  private loadCities(): void {
    this._mbaService.getAllCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
      },
      error: (err) => {
        console.error('Error loading cities:', err);
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
   * Handle khi user chọn country từ dropdown (education)
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
   * Handle khi user chọn correspondence city từ dropdown
   */
  onCorrespondenceCityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const cityCode = selectElement.value;
    
    if (cityCode) {
      const selectedCity = this.cities().find(c => c.cityCode === cityCode);
      if (selectedCity) {
        this.personalDetails.patchValue({
          correspondenceCityName: selectedCity.cityName
        });
      }
      
      // Enable district dropdown
      this.personalDetails.get('correspondenceDistrictId')?.enable();
      
      // Load districts for selected city
      this._mbaService.getDistrictsByCity(cityCode).subscribe({
        next: (districts) => {
          this.correspondenceDistricts.set(districts);
          // Reset district selection
          this.personalDetails.patchValue({
            correspondenceDistrictId: '',
            correspondenceDistrictName: ''
          });
        },
        error: (err) => {
          console.error('Error loading correspondence districts:', err);
          this.correspondenceDistricts.set([]);
        }
      });
    } else {
      // Disable district dropdown when no city selected
      this.personalDetails.get('correspondenceDistrictId')?.disable();
      this.personalDetails.patchValue({
        correspondenceCityName: '',
        correspondenceDistrictId: '',
        correspondenceDistrictName: ''
      });
      this.correspondenceDistricts.set([]);
    }
  }

  /**
   * Handle khi user chọn correspondence district từ dropdown
   */
  onCorrespondenceDistrictChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const distinctCode = selectElement.value;
    
    if (distinctCode) {
      const selectedDistrict = this.correspondenceDistricts().find(d => d.distinctCode === distinctCode);
      if (selectedDistrict) {
        this.personalDetails.patchValue({
          correspondenceDistrictName: selectedDistrict.distinctName
        });
      }
    } else {
      this.personalDetails.patchValue({
        correspondenceDistrictName: ''
      });
    }
  }

  /**
   * Handle khi user chọn permanent city từ dropdown
   */
  onPermanentCityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const cityCode = selectElement.value;
    
    if (cityCode) {
      const selectedCity = this.cities().find(c => c.cityCode === cityCode);
      if (selectedCity) {
        this.personalDetails.patchValue({
          permanentCityName: selectedCity.cityName
        });
      }
      
      // Enable district dropdown
      this.personalDetails.get('permanentDistrictId')?.enable();
      
      // Load districts for selected city
      this._mbaService.getDistrictsByCity(cityCode).subscribe({
        next: (districts) => {
          this.permanentDistricts.set(districts);
          // Reset district selection
          this.personalDetails.patchValue({
            permanentDistrictId: '',
            permanentDistrictName: ''
          });
        },
        error: (err) => {
          console.error('Error loading permanent districts:', err);
          this.permanentDistricts.set([]);
        }
      });
    } else {
      // Disable district dropdown when no city selected
      this.personalDetails.get('permanentDistrictId')?.disable();
      this.personalDetails.patchValue({
        permanentCityName: '',
        permanentDistrictId: '',
        permanentDistrictName: ''
      });
      this.permanentDistricts.set([]);
    }
  }

  /**
   * Handle khi user chọn permanent district từ dropdown
   */
  onPermanentDistrictChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const distinctCode = selectElement.value;
    
    if (distinctCode) {
      const selectedDistrict = this.permanentDistricts().find(d => d.distinctCode === distinctCode);
      if (selectedDistrict) {
        this.personalDetails.patchValue({
          permanentDistrictName: selectedDistrict.distinctName
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
      this.personalDetails.patchValue({ passportFile: updatedFiles.length > 0 ? updatedFiles : null });
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      graduationYear: ['', [Validators.required, maxYearValidator(new Date().getFullYear())]],
      languageId: ['', Validators.required],
      language: [''],
      file: [null],
    });
  }

  /**
   * Create optional undergraduate form group (no required fields)
   */
  private createOptionalUndergraduateGroup(): FormGroup {
    return this.fb.group({
      university: [''],
      countryId: [''],
      country: [''],
      major: [''],
      graduationYear: ['', [maxYearValidator(new Date().getFullYear())]],
      languageId: [''],
      language: [''],
      file: [null],
    });
  }

  /**
   * Create postgraduate form group
   */
  private createPostgraduateGroup(): FormGroup {
    return this.fb.group({
      university: [''],
      countryId: [''],
      country: [''],
      major: [''],
      graduationYear: [''],
      thesisTitle: [''],
      languageId: [''],
      language: [''],
      file: [null],
    });
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
        let existingFiles: File[] = [];
        
        if (section === 'undergraduates' && index !== undefined) {
          existingFiles = this.undergraduates.at(index).get('file')?.value || [];
          const allFiles = [...existingFiles, ...validFiles];
          this.undergraduates.at(index).patchValue({ file: allFiles });
        } else if (section === 'postgraduates' && index !== undefined) {
          existingFiles = this.postgraduates.at(index).get('file')?.value || [];
          const allFiles = [...existingFiles, ...validFiles];
          this.postgraduates.at(index).patchValue({ file: allFiles });
        }
      }
      
      
      // Reset input to allow selecting the same file again
      input.value = '';
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
        const existingFiles = this.englishQualifications.get('certificateFile')?.value || [];
        const allFiles = [...existingFiles, ...validFiles];
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
      this.englishQualifications.patchValue({ certificateFile: updatedFiles.length > 0 ? updatedFiles : null });
    }
  }

  /**
   * Handle khi user chọn language từ dropdown (undergraduate)
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
