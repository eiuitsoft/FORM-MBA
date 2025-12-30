import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MbaService } from '../../core/services/mba/mba.service';
import { AlertService } from '../../core/services/alert/alert.service';
import { PageLayoutComponent } from '../layouts/page-layout/page-layout.component';
import { PersonalDetailsViewComponent } from './sections/personal-details-view.component';
import { PersonalDetailsEditComponent } from './sections/personal-details-edit.component';
import { ApplicationDetailsViewComponent } from './sections/application-details-view.component';
import { ApplicationDetailsEditComponent } from './sections/application-details-edit.component';
import { EducationDetailsViewComponent } from './sections/education-details-view.component';
import { EducationDetailsEditComponent } from './sections/education-details-edit.component';
import { EnglishQualificationsViewComponent } from './sections/english-qualifications-view.component';
import { EnglishQualificationsEditComponent } from './sections/english-qualifications-edit.component';
import { EmploymentHistoryViewComponent } from './sections/employment-history-view.component';
import { EmploymentHistoryEditComponent } from './sections/employment-history-edit.component';
// Validators
import { uniqueFieldValidator } from '../../../validators/unique-field.validator';
import { passportFormatValidator } from '../../../validators/passport-format.validator';
import { emailFormatValidator } from '../../../validators/email-format.validator';
import { minAgeValidator } from '../../../validators/age.validator';
import { minYearValidator } from '../../../validators/year.validator';
import { maxDateValidator, dateRangeValidator } from '../../../validators/date.validator';
import { scoreRangeValidator } from '../../../validators/conditional.validator';
import { atLeastOneEnglishQualificationValidator } from '../../../validators/english-qualification.validator';
import { of } from 'rxjs';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    PageLayoutComponent,
    PersonalDetailsViewComponent,
    PersonalDetailsEditComponent,
    ApplicationDetailsViewComponent,
    ApplicationDetailsEditComponent,
    EducationDetailsViewComponent,
    EducationDetailsEditComponent,
    EnglishQualificationsViewComponent,
    EnglishQualificationsEditComponent,
    EmploymentHistoryViewComponent,
    EmploymentHistoryEditComponent
  ],
  templateUrl: './application-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationDetailComponent implements OnInit {
  private readonly _mbaService = inject(MbaService);
  private readonly _alertService = inject(AlertService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  applicationId = signal<string>('');
  loading = signal(false);
  saving = signal(false);
  exporting = signal(false);
  isEditMode = signal(false);
  applicationData = signal<any>(null);
  uploadedFiles = signal<any[]>([]);
  undergraduateFiles = signal<any[][]>([]);
  postgraduateFiles = signal<any[][]>([]);
  englishFiles = signal<any[]>([]);
  
  // Dropdown data
  countries = signal<any[]>([]);
  languages = signal<any[]>([]);
  provinces = signal<any[]>([]);
  correspondenceWards = signal<any[]>([]);
  permanentWards = signal<any[]>([]);
  correspondenceWardInfo = signal<any>(null);
  permanentWardInfo = signal<any>(null);
  
  // Edit form
  editForm!: FormGroup;

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.applicationId.set(id);
      this.loadApplicationData(id);
      this.loadDropdownData();
    } else {
      this._alertService.error('Error', 'Invalid application ID');
      this._router.navigate(['/login']);
    }
  }

  private loadApplicationData(id: string): void {
    this.loading.set(true);

    // TEMPORARY: Mock data for development when BE is not available
    if (id === 'mock' || id === 'test') {
      const mockData = {
        id: 'mock-id-123',
        personalDetails: {
          id: 'pd-1',
          fullName: 'John Doe',
          nationalityId: '11111111-1111-1111-1111-111111111111',
          nationalityName: 'Vietnam',
          gender: 1,
          dateOfBirth: '1990-01-01',
          placeOfBirth: 'Hanoi',
          passportNo: 'A1234567',
          dateIssued: '2020-01-01',
          email: 'john.doe@example.com',
          mobile: '+84123456789',
          jobTitle: 'Software Engineer',
          organization: 'Tech Company',
          correspondenceCityId: '79',
          correspondenceCityName: 'Thành phố Hồ Chí Minh',
          correspondenceDistrictId: '',
          correspondenceDistrictName: '',
          correspondenceAddress: '123 Main St',
          permanentCityId: '79',
          permanentCityName: 'Thành phố Hồ Chí Minh',
          permanentDistrictId: '',
          permanentDistrictName: '',
          permanentAddress: '123 Main St',
          uploadedFiles: []
        },
        applicationDetails: {
          programId: '99999999-9999-9999-9999-999999999999',
          programName: 'Master of Business Administration',
          programCode: 'MBA',
          track: 0,
          admissionYear: 2025,
          admissionIntake: 'Fall'
        },
        educationDetails: {
          undergraduates: [{
            id: 'ug-1',
            university: 'Test University',
            countryId: '11111111-1111-1111-1111-111111111111',
            countryName: 'Vietnam',
            major: 'Computer Science',
            graduationYear: 2015,
            languageId: 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
            languageName: 'English',
            thesisTitle: '',
            uploadedFiles: []
          }],
          postgraduates: []
        },
        englishQualifications: {
          ielts: {
            id: 'ielts-1',
            name: 'IELTS',
            score: '7.5',
            date: '2023-01-01',
            uploadedFiles: []
          },
          toefl: null,
          other: null
        },
        employmentHistory: {
          position1: {
            id: 'emp-1',
            organizationName: 'Tech Company',
            jobTitle: 'Software Engineer',
            fromDate: '2020-01-01',
            toDate: '2024-12-31',
            address: '123 Tech St'
          },
          position2: null
        },
        declaration: {
          agreed: true
        }
      };
      
      this.applicationData.set(mockData);
      this.uploadedFiles.set([]);
      this.loading.set(false);
      return;
    }

    this._mbaService.getById(id).subscribe({
      next: (data) => {
        // Load ward info for correspondence and permanent cities
        const loadPromises: Promise<void>[] = [];
        
        // Load correspondence ward info
        if (data.personalDetails?.correspondenceCityId) {
          const promise = new Promise<void>((resolve) => {
            this._mbaService.getWardById(data.personalDetails.correspondenceCityId).subscribe({
              next: (ward) => {
                // Update data with ward info
                data.personalDetails.correspondenceCityName = ward.provinceName;
                data.personalDetails.correspondenceDistrictName = ward.wardName;
                resolve();
              },
              error: (err) => {
                console.error('Error loading correspondence ward:', err);
                resolve();
              }
            });
          });
          loadPromises.push(promise);
        }
        
        // Load permanent ward info
        if (data.personalDetails?.permanentCityId) {
          const promise = new Promise<void>((resolve) => {
            this._mbaService.getWardById(data.personalDetails.permanentCityId).subscribe({
              next: (ward) => {
                // Update data with ward info
                data.personalDetails.permanentCityName = ward.provinceName;
                data.personalDetails.permanentDistrictName = ward.wardName;
                resolve();
              },
              error: (err) => {
                console.error('Error loading permanent ward:', err);
                resolve();
              }
            });
          });
          loadPromises.push(promise);
        }
        
        // Wait for all ward info to load, then set data and load files
        Promise.all(loadPromises).then(() => {
          this.applicationData.set(data);
          // Load files for all entities
          this.loadAllFiles(id, data);
          this.loading.set(false);
        });
      },
      error: (err) => {
        console.error('Error loading application:', err);
        this._alertService.error('Error', 'Failed to load application data');
        this.loading.set(false);
        this._router.navigate(['/login']);
      }
    });
  }

  private loadDropdownData(): void {
    this._mbaService.getActiveCountries().subscribe({
      next: (countries) => this.countries.set(countries),
      error: (err) => console.error('Error loading countries:', err)
    });

    this._mbaService.getActiveLanguages().subscribe({
      next: (languages) => this.languages.set(languages),
      error: (err) => console.error('Error loading languages:', err)
    });

    this._mbaService.getProvinces().subscribe({
      next: (provinces) => this.provinces.set(provinces),
      error: (err) => console.error('Error loading provinces:', err)
    });
  }

  /**
   * Load files for all entities (personal, education, english)
   */
  private loadAllFiles(studentId: string, data: any): void {
    // Load personal details files (category 1, no entityId)
    this._mbaService.getFilesByCategory(studentId, 1).subscribe({
      next: (result) => {
        if (result.success && result.data?.files) {
          this.uploadedFiles.set(result.data.files);
        } else {
          this.uploadedFiles.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading personal files:', err);
        this.uploadedFiles.set([]);
      }
    });

    // Load undergraduate files for each degree
    const ugFiles: any[][] = [];
    data?.educationDetails?.undergraduates?.forEach((ug: any, index: number) => {
      if (ug.id) {
        this._mbaService.getFilesByCategory(studentId, 2, ug.id).subscribe({
          next: (result) => {
            ugFiles[index] = result.success && result.data?.files ? result.data.files : [];
            this.undergraduateFiles.set([...ugFiles]);
          },
          error: (err) => {
            console.error(`Error loading undergraduate files for degree ${index}:`, err);
            ugFiles[index] = [];
            this.undergraduateFiles.set([...ugFiles]);
          }
        });
      } else {
        ugFiles[index] = [];
      }
    });
    if (ugFiles.length > 0) {
      this.undergraduateFiles.set(ugFiles);
    }

    // Load postgraduate files for each degree
    const pgFiles: any[][] = [];
    data?.educationDetails?.postgraduates?.forEach((pg: any, index: number) => {
      if (pg.id) {
        this._mbaService.getFilesByCategory(studentId, 3, pg.id).subscribe({
          next: (result) => {
            pgFiles[index] = result.success && result.data?.files ? result.data.files : [];
            this.postgraduateFiles.set([...pgFiles]);
          },
          error: (err) => {
            console.error(`Error loading postgraduate files for degree ${index}:`, err);
            pgFiles[index] = [];
            this.postgraduateFiles.set([...pgFiles]);
          }
        });
      } else {
        pgFiles[index] = [];
      }
    });
    if (pgFiles.length > 0) {
      this.postgraduateFiles.set(pgFiles);
    }

    // Load english qualification files (category 4)
    // Get entityId from first non-null english qualification
    const englishEntityId = data?.englishQualifications?.ielts?.id 
      || data?.englishQualifications?.toefl?.id 
      || data?.englishQualifications?.other?.id;
    
    if (englishEntityId) {
      this._mbaService.getFilesByCategory(studentId, 4, englishEntityId).subscribe({
        next: (result) => {
          if (result.success && result.data?.files) {
            this.englishFiles.set(result.data.files);
          } else {
            this.englishFiles.set([]);
          }
        },
        error: (err) => {
          console.error('Error loading english files:', err);
          this.englishFiles.set([]);
        }
      });
    } else {
      this.englishFiles.set([]);
    }
  }

  toggleEditMode(): void {
    this.isEditMode.set(true);
    const data = this.applicationData();
    
    // Load files for edit mode (reuse loadAllFiles method)
    this.loadAllFiles(this.applicationId(), data);
    
    // Load ward info and wards list for correspondence city
    if (data?.personalDetails?.correspondenceCityId) {
      this._mbaService.getWardById(data.personalDetails.correspondenceCityId).subscribe({
        next: (ward) => {
          this.correspondenceWardInfo.set(ward);
          // Update form with province and ward codes
          if (this.editForm) {
            this.personalDetailsForm.patchValue({
              correspondenceCityId: ward.provinceCode,
              correspondenceCityName: ward.provinceName,
              correspondenceDistrictId: ward.wardCode,
              correspondenceDistrictName: ward.wardName
            });
          }
          // Load wards for this province
          this._mbaService.getWardsByProvinceCode(ward.provinceCode).subscribe({
            next: (wards) => this.correspondenceWards.set(wards),
            error: (err) => console.error('Error loading correspondence wards:', err)
          });
        },
        error: (err) => console.error('Error loading correspondence ward info:', err)
      });
    }
    
    // Load ward info and wards list for permanent city
    if (data?.personalDetails?.permanentCityId) {
      this._mbaService.getWardById(data.personalDetails.permanentCityId).subscribe({
        next: (ward) => {
          this.permanentWardInfo.set(ward);
          // Update form with province and ward codes
          if (this.editForm) {
            this.personalDetailsForm.patchValue({
              permanentCityId: ward.provinceCode,
              permanentCityName: ward.provinceName,
              permanentDistrictId: ward.wardCode,
              permanentDistrictName: ward.wardName
            });
          }
          // Load wards for this province
          this._mbaService.getWardsByProvinceCode(ward.provinceCode).subscribe({
            next: (wards) => this.permanentWards.set(wards),
            error: (err) => console.error('Error loading permanent wards:', err)
          });
        },
        error: (err) => console.error('Error loading permanent ward info:', err)
      });
    }
    
    this.initializeEditForm();
  }

  private initializeEditForm(): void {
    const data = this.applicationData();
    const originalPassport = data.personalDetails.passportNo;
    const originalMobile = data.personalDetails.mobile;
    
    // correspondenceCityId and permanentCityId are actually Ward IDs
    // We need to get ward info to extract provinceCode and wardCode
    // These will be populated after ward info is loaded in toggleEditMode()
    
    this.editForm = this._fb.group({
      personalDetails: this._fb.group({
        fullName: [data.personalDetails.fullName, [Validators.required, Validators.minLength(2)]],
        nationalityId: [data.personalDetails.nationalityId, Validators.required],
        gender: [data.personalDetails.gender, Validators.required],
        dateOfBirth: [this.formatDateForInput(data.personalDetails.dateOfBirth), [Validators.required, minAgeValidator(18)]],
        placeOfBirth: [data.personalDetails.placeOfBirth, Validators.required],
        passportNo: [
          data.personalDetails.passportNo, 
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(12),
            passportFormatValidator()
          ],
          [uniqueFieldValidator(
            (val) => {
              // Only check if value changed from original
              if (val === originalPassport) return of(false);
              return this._mbaService.checkPassportExists(val);
            },
            'passportExists'
          )]
        ],
        dateIssued: [this.formatDateForInput(data.personalDetails.dateIssued), Validators.required],
        email: [data.personalDetails.email, [Validators.required, Validators.email, emailFormatValidator()]],
        mobile: [
          data.personalDetails.mobile, 
          [Validators.required],
          [uniqueFieldValidator(
            (val: any) => {
              // Extract e164Number from intl-tel-input object
              const phoneNumber = val?.e164Number || val;
              // Only check if value changed from original
              if (phoneNumber === originalMobile) return of(false);
              if (!phoneNumber) return of(false);
              return this._mbaService.checkMobileExists(phoneNumber);
            },
            'mobileExists'
          )]
        ],
        jobTitle: [data.personalDetails.jobTitle, Validators.required],
        organization: [data.personalDetails.organization, Validators.required],
        correspondenceCityId: [data.personalDetails.correspondenceCityId || ''],
        correspondenceCityName: [data.personalDetails.correspondenceCityName || ''],
        correspondenceDistrictId: [data.personalDetails.correspondenceDistrictId || ''],
        correspondenceDistrictName: [data.personalDetails.correspondenceDistrictName || ''],
        correspondenceAddress: [data.personalDetails.correspondenceAddress, Validators.required],
        permanentCityId: [data.personalDetails.permanentCityId || ''],
        permanentCityName: [data.personalDetails.permanentCityName || ''],
        permanentDistrictId: [data.personalDetails.permanentDistrictId || ''],
        permanentDistrictName: [data.personalDetails.permanentDistrictName || ''],
        permanentAddress: [data.personalDetails.permanentAddress, Validators.required],
      }),
      applicationDetails: this._fb.group({
        admissionYear: [data.applicationDetails.admissionYear || new Date().getFullYear(), [Validators.required, minYearValidator(new Date().getFullYear())]]
      }),
      educationDetails: this._fb.group({
        undergraduates: this._fb.array(
          data.educationDetails.undergraduates.map((ug: any, index: number) => {
            const validators = index === 0 
              ? [Validators.required, minYearValidator(1950)]
              : (ug.graduationYear ? [minYearValidator(1950)] : []);
            
            return this._fb.group({
              id: [ug.id],
              university: [ug.university, index === 0 ? Validators.required : null],
              countryId: [ug.countryId, index === 0 ? Validators.required : null],
              major: [ug.major, index === 0 ? Validators.required : null],
              graduationYear: [ug.graduationYear || '', validators],
              languageId: [ug.languageId, index === 0 ? Validators.required : null],
              thesisTitle: [ug.thesisTitle || '']
            });
          })
        ),
        postgraduates: this._fb.array(
          data.educationDetails.postgraduates.map((pg: any) => {
            const validators = pg.graduationYear ? [minYearValidator(1950)] : [];
            
            return this._fb.group({
              id: [pg.id],
              university: [pg.university || ''],
              countryId: [pg.countryId || ''],
              major: [pg.major || ''],
              graduationYear: [pg.graduationYear || '', validators],
              languageId: [pg.languageId || ''],
              thesisTitle: [pg.thesisTitle || '']
            });
          })
        )
      }),
      englishQualifications: this._fb.group({
        ielts: this._fb.group({
          id: [data.englishQualifications.ielts?.id],
          score: [data.englishQualifications.ielts?.score || '', scoreRangeValidator(0, 9)],
          date: [this.formatDateForInput(data.englishQualifications.ielts?.date), maxDateValidator()]
        }),
        toefl: this._fb.group({
          id: [data.englishQualifications.toefl?.id],
          score: [data.englishQualifications.toefl?.score || '', scoreRangeValidator(0, 120)],
          date: [this.formatDateForInput(data.englishQualifications.toefl?.date), maxDateValidator()]
        }),
        other: this._fb.group({
          id: [data.englishQualifications.other?.id],
          name: [data.englishQualifications.other?.name || ''],
          score: [data.englishQualifications.other?.score || ''],
          date: [this.formatDateForInput(data.englishQualifications.other?.date), maxDateValidator()]
        })
      }, { validators: atLeastOneEnglishQualificationValidator() }),
      employmentHistory: this._fb.group({
        position1: this._fb.group({
          id: [data.employmentHistory.position1?.id],
          organizationName: [data.employmentHistory.position1?.organizationName || ''],
          jobTitle: [data.employmentHistory.position1?.jobTitle || ''],
          fromDate: [this.formatMonthForInput(data.employmentHistory.position1?.fromDate)],
          toDate: [this.formatMonthForInput(data.employmentHistory.position1?.toDate)],
          address: [data.employmentHistory.position1?.address || '']
        }, { validators: dateRangeValidator('fromDate', 'toDate') }),
        position2: this._fb.group({
          id: [data.employmentHistory.position2?.id],
          organizationName: [data.employmentHistory.position2?.organizationName || ''],
          jobTitle: [data.employmentHistory.position2?.jobTitle || ''],
          fromDate: [this.formatMonthForInput(data.employmentHistory.position2?.fromDate)],
          toDate: [this.formatMonthForInput(data.employmentHistory.position2?.toDate)],
          address: [data.employmentHistory.position2?.address || '']
        }, { validators: dateRangeValidator('fromDate', 'toDate') })
      })
    });
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
  }

  saveChanges(): void {
    if (this.editForm.invalid) {
      // Log all validation errors for debugging
      this.logValidationErrors();
      this._alertService.error('Error', 'Please fill in all required fields');
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formData = this.transformFormData();

    this._mbaService.update(this.applicationId(), formData).subscribe({
      next: (res) => {
        if (res.success) {
          this._alertService.success('Success!', 'Application updated successfully!');
          this.isEditMode.set(false);
          this.loadApplicationData(this.applicationId());
        } else {
          this._alertService.error('Error', res.message || 'Failed to update application');
        }
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Update error:', err);
        this._alertService.error('Error', err.message || 'An error occurred while updating the application');
        this.saving.set(false);
      }
    });
  }

  private transformFormData(): any {
    const rawValue = this.editForm.getRawValue();
    const data = this.applicationData();

    // Extract phone number from intl-tel-input object if needed
    let mobileValue = rawValue.personalDetails.mobile;
    if (typeof mobileValue === 'object' && mobileValue?.e164Number) {
      mobileValue = mobileValue.e164Number;
    }

    // Get ward.id for correspondence and permanent cities
    // If user changed ward, use the new ward.id, otherwise use original
    const correspondenceCityId = this.correspondenceWardInfo()?.id || data.personalDetails.correspondenceCityId;
    const permanentCityId = this.permanentWardInfo()?.id || data.personalDetails.permanentCityId;

    // Files are already uploaded via file manager dialog, no need to send in payload

    return {
      id: this.applicationId(),
      personalDetails: {
        id: data.personalDetails.id,
        fullName: rawValue.personalDetails.fullName,
        nationalityId: rawValue.personalDetails.nationalityId,
        nationalityName: this.countries().find(c => c.id === rawValue.personalDetails.nationalityId)?.name || '',
        gender: rawValue.personalDetails.gender,
        dateOfBirth: rawValue.personalDetails.dateOfBirth,
        placeOfBirth: rawValue.personalDetails.placeOfBirth,
        passportNo: rawValue.personalDetails.passportNo,
        dateIssued: rawValue.personalDetails.dateIssued,
        email: rawValue.personalDetails.email,
        mobile: mobileValue,
        jobTitle: rawValue.personalDetails.jobTitle,
        organization: rawValue.personalDetails.organization,
        profileCode: data.personalDetails.profileCode || '',
        correspondenceCityId: correspondenceCityId,
        correspondenceAddress: rawValue.personalDetails.correspondenceAddress,
        permanentCityId: permanentCityId,
        permanentAddress: rawValue.personalDetails.permanentAddress
        // files removed - already uploaded via file manager
      },
      applicationDetails: {
        ...data.applicationDetails,
        admissionYear: rawValue.applicationDetails.admissionYear
      },
      educationDetails: {
        undergraduates: rawValue.educationDetails.undergraduates.map((ug: any, index: number) => {
          return {
            id: ug.id,
            university: ug.university,
            countryId: ug.countryId,
            countryName: this.countries().find(c => c.id === ug.countryId)?.name || '',
            major: ug.major,
            graduationYear: ug.graduationYear,
            languageId: ug.languageId,
            languageName: this.languages().find(l => l.id === ug.languageId)?.name || '',
            sortOrder: index,
            thesisTitle: ug.thesisTitle || ''
            // files removed - already uploaded via file manager
          };
        }),
        postgraduates: rawValue.educationDetails.postgraduates.map((pg: any, index: number) => {
          return {
            id: pg.id,
            university: pg.university,
            countryId: pg.countryId,
            countryName: this.countries().find(c => c.id === pg.countryId)?.name || '',
            major: pg.major,
            graduationYear: pg.graduationYear,
            languageId: pg.languageId,
            languageName: this.languages().find(l => l.id === pg.languageId)?.name || '',
            sortOrder: index,
            thesisTitle: pg.thesisTitle || ''
            // files removed - already uploaded via file manager
          };
        })
      },
      englishQualifications: {
        ielts: rawValue.englishQualifications.ielts.score ? {
          id: rawValue.englishQualifications.ielts.id,
          name: 'IELTS',
          score: rawValue.englishQualifications.ielts.score,
          date: rawValue.englishQualifications.ielts.date
        } : null,
        toefl: rawValue.englishQualifications.toefl.score ? {
          id: rawValue.englishQualifications.toefl.id,
          name: 'TOEFL',
          score: rawValue.englishQualifications.toefl.score,
          date: rawValue.englishQualifications.toefl.date
        } : null,
        other: rawValue.englishQualifications.other.name ? {
          id: rawValue.englishQualifications.other.id,
          name: rawValue.englishQualifications.other.name,
          score: rawValue.englishQualifications.other.score,
          date: rawValue.englishQualifications.other.date
        } : null
        // files removed - already uploaded via file manager
      },
      employmentHistory: {
        position1: rawValue.employmentHistory.position1.organizationName ? {
          id: rawValue.employmentHistory.position1.id,
          organizationName: rawValue.employmentHistory.position1.organizationName,
          jobTitle: rawValue.employmentHistory.position1.jobTitle,
          fromDate: rawValue.employmentHistory.position1.fromDate,
          toDate: rawValue.employmentHistory.position1.toDate,
          address: rawValue.employmentHistory.position1.address
        } : null,
        position2: rawValue.employmentHistory.position2.organizationName ? {
          id: rawValue.employmentHistory.position2.id,
          organizationName: rawValue.employmentHistory.position2.organizationName,
          jobTitle: rawValue.employmentHistory.position2.jobTitle,
          fromDate: rawValue.employmentHistory.position2.fromDate,
          toDate: rawValue.employmentHistory.position2.toDate,
          address: rawValue.employmentHistory.position2.address
        } : null
      },
      declaration: data.declaration
    };
  }

  // Form array helpers
  get undergraduatesArray(): FormArray {
    return this.editForm?.get('educationDetails.undergraduates') as FormArray;
  }

  get postgraduatesArray(): FormArray {
    return this.editForm?.get('educationDetails.postgraduates') as FormArray;
  }

  addUndergraduate(): void {
    const newIndex = this.undergraduatesArray.length;
    this.undergraduatesArray.push(this._fb.group({
      id: [null],
      university: [''],
      countryId: [''],
      major: [''],
      graduationYear: ['', minYearValidator(1950)],
      languageId: [''],
      thesisTitle: ['']
    }));
    
    // Add empty file array for new degree
    this.undergraduateFiles.update(files => [...files, []]);
  }

  removeUndergraduate(index: number): void {
    if (this.undergraduatesArray.length > 1) {
      this.undergraduatesArray.removeAt(index);
      // Remove files for this degree
      this.undergraduateFiles.update(files => files.filter((_, i) => i !== index));
    }
  }

  addPostgraduate(): void {
    this.postgraduatesArray.push(this._fb.group({
      id: [null],
      university: [''],
      countryId: [''],
      major: [''],
      graduationYear: ['', minYearValidator(1950)],
      languageId: [''],
      thesisTitle: ['']
    }));
    
    // Add empty file array for new degree
    this.postgraduateFiles.update(files => [...files, []]);
  }

  removePostgraduate(index: number): void {
    if (this.postgraduatesArray.length > 1) {
      this.postgraduatesArray.removeAt(index);
      // Remove files for this degree
      this.postgraduateFiles.update(files => files.filter((_, i) => i !== index));
    }
  }

  // Form group getters
  get personalDetailsForm(): FormGroup {
    return this.editForm?.get('personalDetails') as FormGroup;
  }

  get applicationDetailsForm(): FormGroup {
    return this.editForm?.get('applicationDetails') as FormGroup;
  }

  get educationDetailsForm(): FormGroup {
    return this.editForm?.get('educationDetails') as FormGroup;
  }

  get englishQualificationsForm(): FormGroup {
    return this.editForm?.get('englishQualifications') as FormGroup;
  }

  get employmentHistoryForm(): FormGroup {
    return this.editForm?.get('employmentHistory') as FormGroup;
  }

  goBack(): void {
    this._router.navigate(['/login']);
  }

  /**
   * Export application to PDF
   */
  exportToPDF(): void {
    this.exporting.set(true);
    
    this._mbaService.exportToPDF(this.applicationId()).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MBA_Application_${this.applicationId()}.pdf`;
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        
        this.exporting.set(false);
        this._alertService.success('Success!', 'PDF exported successfully!');
      },
      error: (err) => {
        console.error('Export PDF error:', err);
        this._alertService.error('Error', 'Failed to export PDF');
        this.exporting.set(false);
      }
    });
  }

  formatDateTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatDateForInput(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private formatMonthForInput(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // File upload handlers
  onPassportFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error('Error', `File ${file.name} exceeds 5MB limit`);
          continue;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error('Error', `File ${file.name} has invalid type. Only PDF, JPG, and PNG are allowed`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64 = e.target.result.split(',')[1];
          newFiles.push({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: base64
          });

          // Update signal when all files are processed
          if (newFiles.length === files.length || i === files.length - 1) {
            this.uploadedFiles.update(current => [...current, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePassportFile(index: number): void {
    this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
  }

  // Education file handlers
  onDegreeFileChange(event: any, type: string, index: number): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error('Error', `File ${file.name} exceeds 5MB limit`);
          continue;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error('Error', `File ${file.name} has invalid type`);
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64 = e.target.result.split(',')[1];
          newFiles.push({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: base64
          });

          if (newFiles.length === files.length || i === files.length - 1) {
            if (type === 'undergraduate') {
              this.undergraduateFiles.update(current => {
                const updated = [...current];
                if (!updated[index]) updated[index] = [];
                updated[index] = [...updated[index], ...newFiles];
                return updated;
              });
            } else {
              this.postgraduateFiles.update(current => {
                const updated = [...current];
                if (!updated[index]) updated[index] = [];
                updated[index] = [...updated[index], ...newFiles];
                return updated;
              });
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeDegreeFile(type: string, degreeIndex: number, fileIndex: number): void {
    if (type === 'undergraduate') {
      this.undergraduateFiles.update(files => {
        const updated = [...files];
        if (updated[degreeIndex]) {
          updated[degreeIndex] = updated[degreeIndex].filter((_, i) => i !== fileIndex);
        }
        return updated;
      });
    } else {
      this.postgraduateFiles.update(files => {
        const updated = [...files];
        if (updated[degreeIndex]) {
          updated[degreeIndex] = updated[degreeIndex].filter((_, i) => i !== fileIndex);
        }
        return updated;
      });
    }
  }

  // English qualification file handlers
  onEnglishFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error('Error', `File ${file.name} exceeds 5MB limit`);
          continue;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error('Error', `File ${file.name} has invalid type`);
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64 = e.target.result.split(',')[1];
          newFiles.push({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: base64
          });

          if (newFiles.length === files.length || i === files.length - 1) {
            this.englishFiles.update(current => [...current, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeEnglishFile(index: number): void {
    this.englishFiles.update(files => files.filter((_, i) => i !== index));
  }

  // Handle file updates from view mode
  onViewFilesUpdate(files: any[]): void {
    this.uploadedFiles.set(files);
    // Optionally save to server immediately or wait for explicit save
  }

  onEducationFilesUpdate(event: {type: string, index: number, files: any[]}): void {
    if (event.type === 'undergraduate') {
      this.undergraduateFiles.update(current => {
        const updated = [...current];
        updated[event.index] = event.files;
        return updated;
      });
    } else {
      this.postgraduateFiles.update(current => {
        const updated = [...current];
        updated[event.index] = event.files;
        return updated;
      });
    }
  }

  onEnglishFilesUpdate(files: any[]): void {
    this.englishFiles.set(files);
  }

  /**
   * Handle when user selects correspondence province from dropdown
   */
  onCorrespondenceProvinceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const provinceCode = selectElement.value;
    
    if (provinceCode) {
      const selectedProvince = this.provinces().find(p => p.provinceCode === provinceCode);
      if (selectedProvince) {
        this.personalDetailsForm.patchValue({
          correspondenceCityName: selectedProvince.provinceName
        });
      }
      
      // Load wards for selected province
      this._mbaService.getWardsByProvinceCode(provinceCode).subscribe({
        next: (wards) => {
          this.correspondenceWards.set(wards);
          // Reset ward selection
          this.personalDetailsForm.patchValue({
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
      this.personalDetailsForm.patchValue({
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
  onCorrespondenceWardChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const wardCode = selectElement.value;
    
    if (wardCode) {
      const selectedWard = this.correspondenceWards().find(w => w.wardCode === wardCode);
      if (selectedWard) {
        this.personalDetailsForm.patchValue({
          correspondenceDistrictName: selectedWard.wardName
        });
        // Store ward.id separately for API update (don't overwrite correspondenceCityId which is provinceCode)
        this.correspondenceWardInfo.set(selectedWard);
      }
    } else {
      this.personalDetailsForm.patchValue({
        correspondenceDistrictName: ''
      });
      this.correspondenceWardInfo.set(null);
    }
  }

  /**
   * Handle when user selects permanent province from dropdown
   */
  onPermanentProvinceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const provinceCode = selectElement.value;
    
    if (provinceCode) {
      const selectedProvince = this.provinces().find(p => p.provinceCode === provinceCode);
      if (selectedProvince) {
        this.personalDetailsForm.patchValue({
          permanentCityName: selectedProvince.provinceName
        });
      }
      
      // Load wards for selected province
      this._mbaService.getWardsByProvinceCode(provinceCode).subscribe({
        next: (wards) => {
          this.permanentWards.set(wards);
          // Reset ward selection
          this.personalDetailsForm.patchValue({
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
      this.personalDetailsForm.patchValue({
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
  onPermanentWardChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const wardCode = selectElement.value;
    
    if (wardCode) {
      const selectedWard = this.permanentWards().find(w => w.wardCode === wardCode);
      if (selectedWard) {
        this.personalDetailsForm.patchValue({
          permanentDistrictName: selectedWard.wardName
        });
        // Store ward.id separately for API update (don't overwrite permanentCityId which is provinceCode)
        this.permanentWardInfo.set(selectedWard);
      }
    } else {
      this.personalDetailsForm.patchValue({
        permanentDistrictName: ''
      });
      this.permanentWardInfo.set(null);
    }
  }

  /**
   * Log all validation errors for debugging
   */
  private logValidationErrors(): void {
    console.log('=== VALIDATION ERRORS ===');
    
    // Check personal details
    const personalDetails = this.editForm.get('personalDetails') as FormGroup;
    if (personalDetails && personalDetails.invalid) {
      console.log('Personal Details Errors:');
      Object.keys(personalDetails.controls).forEach(key => {
        const control = personalDetails.get(key);
        if (control && control.invalid) {
          console.log(`  - ${key}:`, control.errors);
        }
      });
    }

    // Check application details
    const applicationDetails = this.editForm.get('applicationDetails') as FormGroup;
    if (applicationDetails && applicationDetails.invalid) {
      console.log('Application Details Errors:');
      Object.keys(applicationDetails.controls).forEach(key => {
        const control = applicationDetails.get(key);
        if (control && control.invalid) {
          console.log(`  - ${key}:`, control.errors);
        }
      });
    }

    // Check education details
    const educationDetails = this.editForm.get('educationDetails') as FormGroup;
    if (educationDetails && educationDetails.invalid) {
      console.log('Education Details Errors:');
      
      // Check undergraduates
      const undergraduates = educationDetails.get('undergraduates') as FormArray;
      if (undergraduates && undergraduates.invalid) {
        undergraduates.controls.forEach((control, index) => {
          if (control.invalid) {
            console.log(`  Undergraduate ${index}:`);
            Object.keys((control as FormGroup).controls).forEach(key => {
              const fieldControl = control.get(key);
              if (fieldControl && fieldControl.invalid) {
                console.log(`    - ${key}:`, fieldControl.errors, 'Value:', fieldControl.value);
              }
            });
          }
        });
      }

      // Check postgraduates
      const postgraduates = educationDetails.get('postgraduates') as FormArray;
      if (postgraduates && postgraduates.invalid) {
        postgraduates.controls.forEach((control, index) => {
          if (control.invalid) {
            console.log(`  Postgraduate ${index}:`);
            Object.keys((control as FormGroup).controls).forEach(key => {
              const fieldControl = control.get(key);
              if (fieldControl && fieldControl.invalid) {
                console.log(`    - ${key}:`, fieldControl.errors, 'Value:', fieldControl.value);
              }
            });
          }
        });
      }
    }

    // Check english qualifications
    const englishQualifications = this.editForm.get('englishQualifications') as FormGroup;
    if (englishQualifications && englishQualifications.invalid) {
      console.log('English Qualifications Errors:');
      
      // Check group-level errors
      if (englishQualifications.errors) {
        console.log('  Group errors:', englishQualifications.errors);
      }

      // Check individual fields
      ['ielts', 'toefl', 'other'].forEach(type => {
        const group = englishQualifications.get(type) as FormGroup;
        if (group && group.invalid) {
          console.log(`  ${type}:`);
          Object.keys(group.controls).forEach(key => {
            const control = group.get(key);
            if (control && control.invalid) {
              console.log(`    - ${key}:`, control.errors);
            }
          });
        }
      });
    }

    // Check employment history
    const employmentHistory = this.editForm.get('employmentHistory') as FormGroup;
    if (employmentHistory && employmentHistory.invalid) {
      console.log('Employment History Errors:');
      
      ['position1', 'position2'].forEach(pos => {
        const group = employmentHistory.get(pos) as FormGroup;
        if (group && group.invalid) {
          console.log(`  ${pos}:`);
          
          // Check group-level errors (dateRange validator)
          if (group.errors) {
            console.log(`    Group errors:`, group.errors);
          }

          // Check individual fields
          Object.keys(group.controls).forEach(key => {
            const control = group.get(key);
            if (control && control.invalid) {
              console.log(`    - ${key}:`, control.errors);
            }
          });
        }
      });
    }

    console.log('=== END VALIDATION ERRORS ===');
  }
}
