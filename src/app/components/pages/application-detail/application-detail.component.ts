import { EducationRecord, MBAApplicationDetail } from '@/src/app/core/models/mba/mba-application';
import { AlertService } from '@/src/app/core/services/alert/alert.service';
import { TokenService } from '@/src/app/core/services/auth/token.service';
import { MbaService } from '@/src/app/core/services/mba/mba.service';
import { minAgeValidator } from '@/src/validators/age.validator';
import { completeRecordValidator } from '@/src/validators/complete-record.validator';
import { conditionalRequiredValidator, scoreRangeValidator } from '@/src/validators/conditional.validator';
import { dateRangeValidator, maxDateValidator, minDateYearValidator } from '@/src/validators/date.validator';
import { emailFormatValidator } from '@/src/validators/email-format.validator';
import { atLeastOneEnglishQualificationValidator, completeQualificationValidator } from '@/src/validators/english-qualification.validator';
import { evaluateEducationFileValidation } from '@/src/validators/education-file.validator';
import { passportFormatValidator } from '@/src/validators/passport-format.validator';
import { uniqueFieldValidator } from '@/src/validators/unique-field.validator';
import { maxYearValidator, minYearValidator } from '@/src/validators/year.validator';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ApplicationDetailsEditComponent } from './sections/application-details-edit.component';
import { ApplicationDetailsViewComponent } from './sections/application-details-view.component';
import { EducationDetailsEditComponent } from './sections/education-details-edit.component';
import { EducationDetailsViewComponent } from './sections/education-details-view.component';
import { EmploymentHistoryEditComponent } from './sections/employment-history-edit.component';
import { EmploymentHistoryViewComponent } from './sections/employment-history-view.component';
import { EnglishQualificationsEditComponent } from './sections/english-qualifications-edit.component';
import { EnglishQualificationsViewComponent } from './sections/english-qualifications-view.component';
import { PersonalDetailsEditComponent } from './sections/personal-details-edit.component';
import { PersonalDetailsViewComponent } from './sections/personal-details-view.component';
import { EDUCATION_LEVELS } from '@/src/app/core/constants/education-level';

interface EducationFileErrorState {
  missingDegreeFile?: true;
  missingTranscriptFile?: true;
  missingRecognitionFile?: true;
  missingEnglishMediumFile?: true;
}

interface EducationFileValidationState {
  undergraduates: EducationFileErrorState[];
  postgraduates: EducationFileErrorState[];
}

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
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
  // private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);
  private readonly tokenService = inject(TokenService);
  private readonly _translate = inject(TranslateService);

  applicationId = signal<string>('');
  currentYear = new Date().getFullYear();
  loading = signal(false);
  saving = signal(false);
  exporting = signal(false);
  isEditMode = signal(false);
  showConfirmDialog = signal(false);
  attemptedSave = signal(false);
  applicationData = signal<MBAApplicationDetail>(null);
  uploadedFiles = signal<any[]>([]);
  undergraduateFiles = signal<any[][]>([]);
  postgraduateFiles = signal<any[][]>([]);
  englishFiles = signal<any[]>([]);
  educationFileValidationState = signal<EducationFileValidationState>({ undergraduates: [], postgraduates: [] });

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

  /**
   * Warn user before leaving page with unsaved changes (Edit mode)
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    // Only warn if in edit mode AND form has been changed
    if (this.isEditMode() && this.editForm?.dirty) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    // const id = this._route.snapshot.paramMap.get('id');
    const id = this.tokenService.studentId();
    if (id) {
      this.applicationId.set(id);
      this.loadApplicationData(id);
      this.loadDropdownData();
    } else {
      this._alertService.error(
        this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
        this._translate.instant('AUTH.SESSION_EXPIRED')
      );
      this._router.navigate(['/login']);
    }
  }

  private loadApplicationData(id: string): void {
    this.loading.set(true);

    this._mbaService.getById(id).subscribe({
      next: (data: MBAApplicationDetail) => {
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
        const errorMsg = err.message ? this._translate.instant(err.message) : this._translate.instant('SUBMIT_RESULT.SYSTEM_ERROR');
        this._alertService.error(
          this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
          errorMsg
        );
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
  private loadAllFiles(studentId: string, data: MBAApplicationDetail): void {
    this._mbaService.getFileCategoryCodeMap(1).subscribe({
      next: (categoryMap) => {
        const passportCategoryId = categoryMap['CCCD']?.id;
        const englishCategoryId = categoryMap['ENG']?.id;
        const ugDegreeCategoryId = categoryMap['BCDH']?.id;
        const pgDegreeCategoryId = categoryMap['BCCH']?.id;
        const transcriptCategoryId = categoryMap['BDDH']?.id;
        const recognitionCategoryId = categoryMap['CNVB']?.id;
        const englishMediumCategoryId = categoryMap['XNTA']?.id;

        if (
          !passportCategoryId ||
          !englishCategoryId ||
          !ugDegreeCategoryId ||
          !pgDegreeCategoryId ||
          !transcriptCategoryId ||
          !recognitionCategoryId ||
          !englishMediumCategoryId
        ) {
          console.error('Missing required file categories from API.');
          this.uploadedFiles.set([]);
          this.englishFiles.set([]);
          this.undergraduateFiles.set([]);
          this.postgraduateFiles.set([]);
          return;
        }

        this._mbaService.getFilesByCategory(studentId, passportCategoryId).subscribe({
          next: (result) => {
            this.uploadedFiles.set(result.success && result.data?.files ? result.data.files : []);
          },
          error: (err) => {
            console.error('Error loading personal files:', err);
            this.uploadedFiles.set([]);
          }
        });

        this._mbaService.getFilesByCategory(studentId, englishCategoryId).subscribe({
          next: (result) => {
            this.englishFiles.set(result.success && result.data?.files ? result.data.files : []);
          },
          error: (err) => {
            console.error('Error loading english files:', err);
            this.englishFiles.set([]);
          }
        });

        const ugFiles: any[][] = [];
        data?.educationDetails?.undergraduates?.forEach((ug: EducationRecord, index: number) => {
          if (!ug.id) {
            ugFiles[index] = [];
            return;
          }

          this.loadFilesByCategories(
            studentId,
            ug.id,
            [
              { id: ugDegreeCategoryId, code: 'BCDH' },
              { id: transcriptCategoryId, code: 'BDDH' },
              { id: recognitionCategoryId, code: 'CNVB' },
              { id: englishMediumCategoryId, code: 'XNTA' }
            ],
            (files) => {
              ugFiles[index] = files;
              this.undergraduateFiles.set([...ugFiles]);
            }
          );
        });
        if (ugFiles.length > 0) {
          this.undergraduateFiles.set(ugFiles);
        }

        const pgFiles: any[][] = [];
        data?.educationDetails?.postgraduates?.forEach((pg: EducationRecord, index: number) => {
          if (!pg.id) {
            pgFiles[index] = [];
            return;
          }

          this.loadFilesByCategories(
            studentId,
            pg.id,
            [
              { id: pgDegreeCategoryId, code: 'BCCH' },
              { id: transcriptCategoryId, code: 'BDDH' },
              { id: recognitionCategoryId, code: 'CNVB' },
              { id: englishMediumCategoryId, code: 'XNTA' }
            ],
            (files) => {
              pgFiles[index] = files;
              this.postgraduateFiles.set([...pgFiles]);
            }
          );
        });
        if (pgFiles.length > 0) {
          this.postgraduateFiles.set(pgFiles);
        }
      },
      error: (err) => {
        console.error('Error loading file categories:', err);
        this.uploadedFiles.set([]);
        this.englishFiles.set([]);
        this.undergraduateFiles.set([]);
        this.postgraduateFiles.set([]);
      }
    });
  }

  private loadFilesByCategories(
    studentId: string,
    entityId: string,
    categories: Array<{ id: number; code: string }>,
    onDone: (files: any[]) => void
  ): void {
    if (!categories.length) {
      onDone([]);
      return;
    }

    const mergedFiles: any[] = [];
    let remaining = categories.length;

    categories.forEach((category) => {
      this._mbaService.getFilesByCategory(studentId, category.id, entityId).subscribe({
        next: (result) => {
          if (result.success && result.data?.files) {
            mergedFiles.push(...this.attachCategoryCode(result.data.files, category.code));
          }
        },
        error: (err) => {
          console.error(`Error loading files for category ${category.code}:`, err);
        },
        complete: () => {
          remaining -= 1;
          if (remaining === 0) {
            onDone(mergedFiles);
          }
        }
      });
    });
  }

  private attachCategoryCode(files: any[], categoryCode: string): any[] {
    return (files || []).map((file: any) => ({
      ...file,
      categoryCode
    }));
  }

  toggleEditMode(): void {
    this.isEditMode.set(true);
    this.attemptedSave.set(false);
    this.educationFileValidationState.set({ undergraduates: [], postgraduates: [] });
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
            // Reset dirty after loading initial data
            this.editForm.markAsPristine();
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
            // Reset dirty after loading initial data
            this.editForm.markAsPristine();
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
        fullName: [data.personalDetails.fullName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        nationalityId: [data.personalDetails.nationalityId, Validators.required],
        gender: [data.personalDetails.gender, Validators.required],
        dateOfBirth: [
          this.formatDateForInput(data.personalDetails.dateOfBirth),
          [Validators.required, minAgeValidator(18), maxDateValidator(), minDateYearValidator(1900)]
        ],
        placeOfBirth: [data.personalDetails.placeOfBirth, Validators.required],
        passportNo: [
          data.personalDetails.passportNo,
          [Validators.required, Validators.minLength(6), Validators.maxLength(12), passportFormatValidator()],
          [
            uniqueFieldValidator((val) => {
              // Only check if value changed from original
              if (val === originalPassport) return of(false);
              return this._mbaService.checkPassportExists(val);
            }, 'passportExists')
          ]
        ],
        dateIssued: [this.formatDateForInput(data.personalDetails.dateIssued), [Validators.required, maxDateValidator(), minDateYearValidator(1900)]],
        passportPlaceIssued: [data.personalDetails.passportPlaceIssued, [Validators.required, Validators.maxLength(50)]],
        email: [data.personalDetails.email, [Validators.required, Validators.email, emailFormatValidator()]],
        mobile: [
          data.personalDetails.mobile,
          [Validators.required],
          [
            uniqueFieldValidator((val: any) => {
              // Extract e164Number from intl-tel-input object
              const phoneNumber = val?.e164Number || val;
              // Only check if value changed from original
              if (phoneNumber === originalMobile) return of(false);
              if (!phoneNumber) return of(false);
              return this._mbaService.checkMobileExists(phoneNumber);
            }, 'mobileExists')
          ]
        ],
        jobTitle: [data.personalDetails.jobTitle, [Validators.required, Validators.maxLength(50)]],
        organization: [data.personalDetails.organization, [Validators.required, Validators.maxLength(50)]],
        correspondenceCityId: [data.personalDetails.correspondenceCityId || ''],
        correspondenceCityName: [data.personalDetails.correspondenceCityName || ''],
        correspondenceDistrictId: [data.personalDetails.correspondenceDistrictId || ''],
        correspondenceDistrictName: [data.personalDetails.correspondenceDistrictName || ''],
        correspondenceAddress: [data.personalDetails.correspondenceAddress, [Validators.required, Validators.maxLength(50)]],
        permanentCityId: [data.personalDetails.permanentCityId || ''],
        permanentCityName: [data.personalDetails.permanentCityName || ''],
        permanentDistrictId: [data.personalDetails.permanentDistrictId || ''],
        permanentDistrictName: [data.personalDetails.permanentDistrictName || ''],
        permanentAddress: [data.personalDetails.permanentAddress, [Validators.required, Validators.maxLength(50)]]
      }),
      applicationDetails: this._fb.group({
        admissionYear: [
          data.applicationDetails.admissionYear || new Date().getFullYear(),
          [Validators.required, minYearValidator(new Date().getFullYear())]
        ]
      }),
      educationDetails: this._fb.group({
        undergraduates: this._fb.array(
          (data?.educationDetails?.undergraduates ?? []).map((ug: EducationRecord, index: number) => {
            const validators = [minYearValidator(1950), maxYearValidator(this.currentYear)];
            if (index === 0) {
              validators.push(Validators.required);
            }

            const fieldsToValidate = ['university', 'countryId', 'major', 'graduationYear', 'gpa', 'graduationRank', 'languageId'];
            return this._fb.group(
              {
                id: [ug.id],
                university: [ug.university, index === 0 ? Validators.required : null],
                countryId: [ug.countryId, index === 0 ? Validators.required : null],
                major: [ug.major, index === 0 ? Validators.required : null],
                graduationYear: [ug.graduationYear || '', validators],
                gpa: [ug.gpa || '', index === 0 ? Validators.required : null],
                graduationRank: [ug.graduationRank || '', index === 0 ? Validators.required : null],
                languageId: [ug.languageId, index === 0 ? Validators.required : null],
                thesisTitle: [ug.thesisTitle || '']
              },
              { validators: index === 0 ? null : completeRecordValidator(fieldsToValidate) }
            );
          })
        ),
        postgraduates: this._fb.array(
          (data?.educationDetails?.postgraduates ?? []).map((pg: EducationRecord) => {
            const validators = [minYearValidator(1950), maxYearValidator(this.currentYear)];

            const fieldsToValidate = ['university', 'countryId', 'major', 'graduationYear', 'languageId'];
            return this._fb.group(
              {
                id: [pg.id],
                university: [pg.university || ''],
                countryId: [pg.countryId || ''],
                major: [pg.major || ''],
                graduationYear: [pg.graduationYear || '', validators],
                languageId: [pg.languageId || ''],
                thesisTitle: [pg.thesisTitle || '']
              },
              { validators: completeRecordValidator(fieldsToValidate) }
            );
          })
        )
      }),
      englishQualifications: this._fb.group(
        {
          ielts: this._fb.group(
            {
              id: [data.englishQualifications.ielts?.id],
              score: [data.englishQualifications.ielts?.score || '', scoreRangeValidator(0, 9)],
              date: [this.formatDateForInput(data.englishQualifications.ielts?.date), [maxDateValidator(), minDateYearValidator(1900)]]
            },
            { validators: completeQualificationValidator(['score', 'date']) }
          ),
          toefl: this._fb.group(
            {
              id: [data.englishQualifications.toefl?.id],
              score: [data.englishQualifications.toefl?.score || '', scoreRangeValidator(0, 120)],
              date: [this.formatDateForInput(data.englishQualifications.toefl?.date), [maxDateValidator(), minDateYearValidator(1900)]]
            },
            { validators: completeQualificationValidator(['score', 'date']) }
          ),
          other: this._fb.group(
            {
              id: [data.englishQualifications.other?.id],
              name: [data.englishQualifications.other?.name || ''],
              score: [data.englishQualifications.other?.score || ''],
              date: [this.formatDateForInput(data.englishQualifications.other?.date), [maxDateValidator(), minDateYearValidator(1900)]]
            },
            { validators: completeQualificationValidator(['name', 'score', 'date']) }
          )
        },
        { validators: atLeastOneEnglishQualificationValidator() }
      ),
      employmentHistory: this._fb.group({
        totalExpYears: [data.employmentHistory.totalExpYears, [Validators.required, Validators.min(0)]],
        totalExpMonths: [
          data.employmentHistory.totalExpMonths,
          [Validators.required, Validators.min(0), Validators.max(12)]
        ],
        position1: this._fb.group(
          {
            id: [data.employmentHistory.position1?.id],
            organizationName: [data.employmentHistory.position1?.organizationName || '', Validators.maxLength(50)],
            jobTitle: [data.employmentHistory.position1?.jobTitle || '', Validators.maxLength(50)],
            fromDate: [this.formatMonthForInput(data.employmentHistory.position1?.fromDate), [minDateYearValidator(1900)]],
            toDate: [this.formatMonthForInput(data.employmentHistory.position1?.toDate), [minDateYearValidator(1900)]],
            address: [data.employmentHistory.position1?.address || '', Validators.maxLength(50)]
          },
          { validators: [dateRangeValidator('fromDate', 'toDate'), completeRecordValidator(['organizationName', 'jobTitle', 'fromDate', 'toDate', 'address'])] }
        ),
        position2: this._fb.group(
          {
            id: [data.employmentHistory.position2?.id],
            organizationName: [data.employmentHistory.position2?.organizationName || '', Validators.maxLength(50)],
            jobTitle: [data.employmentHistory.position2?.jobTitle || '', Validators.maxLength(50)],
            fromDate: [this.formatMonthForInput(data.employmentHistory.position2?.fromDate), [minDateYearValidator(1900)]],
            toDate: [this.formatMonthForInput(data.employmentHistory.position2?.toDate), [minDateYearValidator(1900)]],
            address: [data.employmentHistory.position2?.address || '', Validators.maxLength(50)]
          },
          { validators: [dateRangeValidator('fromDate', 'toDate'), completeRecordValidator(['organizationName', 'jobTitle', 'fromDate', 'toDate', 'address'])] }
        )
      })
    });

    // Reset dirty state after initializing with existing data
    // Form should only be dirty when user actually changes something
    this.editForm.markAsPristine();
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.attemptedSave.set(false);
    this.educationFileValidationState.set({ undergraduates: [], postgraduates: [] });
  }

  saveChanges(): void {
    this.attemptedSave.set(true);
    const validEducationFiles = this.validateEducationFileRequirements();

    if (this.editForm.invalid || !validEducationFiles) {
      this.logValidationErrors();
      this._alertService.error(
        this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
        !validEducationFiles
          ? this._translate.instant('EDUCATION_DETAILS.FILE_FIELDS_REQUIRED')
          : this._translate.instant('COMMON.ERROR_REVIEW')
      );
      return;
    }
    this.showConfirmDialog.set(true);
  }

  confirmSave(): void {
    this.showConfirmDialog.set(false);
    this.saving.set(true);
    const formData = this.transformFormData();

    this._mbaService.update(this.applicationId(), formData).subscribe({
      next: (res) => {
        if (res.success) {
          this._alertService.success(
            this._translate.instant('UPDATE_RESULT.SUCCESS_TITLE'),
            this._translate.instant('UPDATE_RESULT.SUCCESS_MESSAGE')
          );
          this.isEditMode.set(false);
          this.attemptedSave.set(false);
          this.educationFileValidationState.set({ undergraduates: [], postgraduates: [] });
          this.loadApplicationData(this.applicationId());
        } else {
          this._alertService.error(
            this._translate.instant('UPDATE_RESULT.ERROR_TITLE'),
            res.message ? this._translate.instant(res.message) : this._translate.instant('UPDATE_RESULT.ERROR_MESSAGE')
          );
        }
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Update error:', err);
        this._alertService.error(
          this._translate.instant('UPDATE_RESULT.ERROR_TITLE'),
          err.message ? this._translate.instant(err.message) : this._translate.instant('UPDATE_RESULT.SYSTEM_ERROR')
        );
        this.saving.set(false);
      }
    });
  }

  cancelSave(): void {
    this.showConfirmDialog.set(false);
  }

  private transformFormData(): any {
    const appDetail = this.applicationData();
    const rawValue = this.editForm.getRawValue() as MBAApplicationDetail;
    const editPersonal = rawValue.personalDetails;
    const editEnglish = rawValue.englishQualifications;
    const editEmployment = rawValue.employmentHistory;

    // Extract phone number from intl-tel-input object if needed
    let mobileValue = editPersonal.mobile;
    if (typeof mobileValue === 'object' && mobileValue?.e164Number) {
      mobileValue = mobileValue.e164Number;
    }

    // Get ward.id for correspondence and permanent cities
    // If user changed ward, use the new ward.id, otherwise use original
    const correspondenceCityId = this.correspondenceWardInfo()?.id || appDetail.personalDetails.correspondenceCityId;
    const permanentCityId = this.permanentWardInfo()?.id || appDetail.personalDetails.permanentCityId;

    // Files are already uploaded via file manager dialog, no need to send in payload

    return {
      id: this.applicationId(),
      personalDetails: {
        id: appDetail.personalDetails.id,
        profileCode: appDetail.personalDetails.profileCode || '',
        fullName: editPersonal.fullName,
        nationalityId: editPersonal.nationalityId,
        nationalityName: this.countries().find((c) => c.id === editPersonal.nationalityId)?.name || '',
        gender: editPersonal.gender,
        dateOfBirth: editPersonal.dateOfBirth,
        placeOfBirth: editPersonal.placeOfBirth,
        passportNo: editPersonal.passportNo,
        dateIssued: editPersonal.dateIssued,
        passportPlaceIssued: editPersonal.passportPlaceIssued,
        email: editPersonal.email,
        mobile: mobileValue,
        jobTitle: editPersonal.jobTitle,
        organization: editPersonal.organization,
        correspondenceCityId: correspondenceCityId,
        correspondenceAddress: editPersonal.correspondenceAddress,
        permanentCityId: permanentCityId,
        permanentAddress: editPersonal.permanentAddress
        // files removed - already uploaded via file manager
      },
      applicationDetails: {
        ...appDetail.applicationDetails,
        admissionYear: rawValue.applicationDetails.admissionYear
      },
      educationDetails: {
        undergraduates: (rawValue?.educationDetails?.undergraduates ?? []).map((ug: EducationRecord, index: number) => {
          return {
            id: ug.id,
            university: ug.university,
            countryId: ug.countryId,
            countryName: this.countries().find((c) => c.id === ug.countryId)?.name || '',
            major: ug.major,
            graduationYear: ug.graduationYear,
            gpa: ug.gpa,
            graduationRank: ug.graduationRank,
            languageId: ug.languageId,
            languageName: this.languages().find((l) => l.id === ug.languageId)?.name || '',
            sortOrder: index,
            thesisTitle: ug.thesisTitle || ''
            // files removed - already uploaded via file manager
          };
        }),
        postgraduates: (rawValue?.educationDetails?.postgraduates ?? []).map((pg: EducationRecord, index: number) => {
          return {
            id: pg.id,
            university: pg.university,
            countryId: pg.countryId,
            countryName: this.countries().find((c) => c.id === pg.countryId)?.name || '',
            major: pg.major,
            graduationYear: pg.graduationYear,
            languageId: pg.languageId,
            languageName: this.languages().find((l) => l.id === pg.languageId)?.name || '',
            sortOrder: index,
            thesisTitle: pg.thesisTitle || ''
            // files removed - already uploaded via file manager
          };
        })
      },
      englishQualifications: {
        ielts: editEnglish.ielts.score
          ? {
              id: editEnglish.ielts.id,
              name: 'IELTS',
              score: editEnglish.ielts.score,
              date: editEnglish.ielts.date
            }
          : null,
        toefl: editEnglish.toefl.score
          ? {
              id: editEnglish.toefl.id,
              name: 'TOEFL',
              score: editEnglish.toefl.score,
              date: editEnglish.toefl.date
            }
          : null,
        other: editEnglish.other.name
          ? {
              id: editEnglish.other.id,
              name: editEnglish.other.name,
              score: editEnglish.other.score,
              date: editEnglish.other.date
            }
          : null
        // files removed - already uploaded via file manager
      },
      employmentHistory: {
        totalExpYears: editEmployment.totalExpYears,
        totalExpMonths: editEmployment.totalExpMonths,
        position1: editEmployment.position1.organizationName
          ? {
              id: editEmployment.position1.id,
              organizationName: editEmployment.position1.organizationName,
              jobTitle: editEmployment.position1.jobTitle,
              fromDate: editEmployment.position1.fromDate,
              toDate: editEmployment.position1.toDate,
              address: editEmployment.position1.address
            }
          : null,
        position2: editEmployment.position2.organizationName
          ? {
              id: editEmployment.position2.id,
              organizationName: editEmployment.position2.organizationName,
              jobTitle: editEmployment.position2.jobTitle,
              fromDate: editEmployment.position2.fromDate,
              toDate: editEmployment.position2.toDate,
              address: editEmployment.position2.address
            }
          : null
      },
      declaration: appDetail.declaration
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
    this.undergraduatesArray.push(
      this._fb.group(
        {
          id: [null],
          university: [''],
          countryId: [''],
          major: [''],
          graduationYear: ['', [minYearValidator(1950), maxYearValidator(this.currentYear)]],
          gpa: [''],
          graduationRank: [''],
          languageId: [''],
          thesisTitle: ['']
        },
        { validators: completeRecordValidator(['university', 'countryId', 'major', 'graduationYear', 'gpa', 'graduationRank', 'languageId']) }
      )
    );

    // Add empty file array for new degree
    this.undergraduateFiles.update((files) => [...files, []]);
    this.refreshEducationFileValidationIfNeeded();
  }

  removeUndergraduate(index: number): void {
    if (this.undergraduatesArray.length > 1) {
      this.undergraduatesArray.removeAt(index);
      // Remove files for this degree
      this.undergraduateFiles.update((files) => files.filter((_, i) => i !== index));
      this.refreshEducationFileValidationIfNeeded();
    }
  }

  addPostgraduate(): void {
    this.postgraduatesArray.push(
      this._fb.group(
        {
          id: [null],
          university: [''],
          countryId: [''],
          major: [''],
          graduationYear: ['', [minYearValidator(1950), maxYearValidator(this.currentYear)]],
          languageId: [''],
          thesisTitle: ['']
        },
        { validators: completeRecordValidator(['university', 'countryId', 'major', 'graduationYear', 'languageId']) }
      )
    );

    // Add empty file array for new degree
    this.postgraduateFiles.update((files) => [...files, []]);
    this.refreshEducationFileValidationIfNeeded();
  }

  removePostgraduate(index: number): void {
    if (this.postgraduatesArray.length > 1) {
      this.postgraduatesArray.removeAt(index);
      // Remove files for this degree
      this.postgraduateFiles.update((files) => files.filter((_, i) => i !== index));
      this.refreshEducationFileValidationIfNeeded();
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
    const language = localStorage.getItem('lang') || 'en';

    this._mbaService.exportToPDF(this.applicationId(), language).subscribe({
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
        this._alertService.success(
          this._translate.instant('SUBMIT_RESULT.SUCCESS_TITLE'),
          this._translate.instant('APPLICATION_PAGE.EXPORT_SUCCESS')
        );
      },
      error: (err) => {
        console.error('Export PDF error:', err);
        const errorMsg = err.message ? this._translate.instant(err.message) : this._translate.instant('APPLICATION_PAGE.EXPORT_ERROR');
        this._alertService.error(
          this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
          errorMsg
        );
        this.exporting.set(false);
      }
    });
  }

  formatDateTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const lang = this._translate.currentLang === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleString(lang, {
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

  private refreshEducationFileValidationIfNeeded(): void {
    if (!this.attemptedSave()) return;
    this.validateEducationFileRequirements();
  }

  private validateEducationFileRequirements(): boolean {
    const rawValue = this.editForm?.getRawValue() as MBAApplicationDetail;
    const validationState: EducationFileValidationState = { undergraduates: [], postgraduates: [] };

    let isValid = true;

    const undergraduates = rawValue?.educationDetails?.undergraduates || [];
    undergraduates.forEach((ug: EducationRecord, index: number) => {
      const files = this.undergraduateFiles()?.[index] || [];
      const errors = evaluateEducationFileValidation({
        alwaysRequired: index === 0,
        isEnteredRecord: this.hasAnyRecordValue(ug, [
          'university',
          'countryId',
          'major',
          'graduationYear',
          'gpa',
          'graduationRank',
          'languageId',
          'thesisTitle'
        ]),
        requireRecognition: this.isForeignCountry(ug?.countryId),
        requireEnglishMedium: this.isForeignCountry(ug?.countryId),
        degreeFileCount: this.countFilesByCategory(files, 'BCDH'),
        transcriptFileCount: this.countFilesByCategory(files, 'BDDH'),
        recognitionFileCount: this.countFilesByCategory(files, 'CNVB'),
        englishMediumFileCount: this.countFilesByCategory(files, 'XNTA')
      });

      validationState.undergraduates[index] = errors || {};
      if (errors) {
        isValid = false;
      }
    });

    const postgraduates = rawValue?.educationDetails?.postgraduates || [];
    postgraduates.forEach((pg: EducationRecord, index: number) => {
      const files = this.postgraduateFiles()?.[index] || [];
      const errors = evaluateEducationFileValidation({
        alwaysRequired: false,
        isEnteredRecord: this.hasAnyRecordValue(pg, [
          'university',
          'countryId',
          'major',
          'graduationYear',
          'languageId',
          'thesisTitle'
        ]),
        requireRecognition: this.isForeignCountry(pg?.countryId),
        requireEnglishMedium: this.isForeignCountry(pg?.countryId),
        degreeFileCount: this.countFilesByCategory(files, 'BCCH'),
        transcriptFileCount: this.countFilesByCategory(files, 'BDDH'),
        recognitionFileCount: this.countFilesByCategory(files, 'CNVB'),
        englishMediumFileCount: this.countFilesByCategory(files, 'XNTA')
      });

      validationState.postgraduates[index] = errors || {};
      if (errors) {
        isValid = false;
      }
    });

    this.educationFileValidationState.set(validationState);
    return isValid;
  }

  private hasAnyRecordValue(record: Record<string, any>, fields: string[]): boolean {
    return fields.some((field) => {
      const value = record?.[field];
      return value !== null && value !== undefined && value.toString().trim() !== '';
    });
  }

  private countFilesByCategory(files: any[], categoryCode: string): number {
    if (!Array.isArray(files)) {
      return 0;
    }

    const normalizedCode = (categoryCode || '').toUpperCase();
    return files.filter((file) => ((file?.categoryCode || file?.CategoryCode || '') as string).toUpperCase() === normalizedCode)
      .length;
  }

  private isForeignCountry(countryId: string | null | undefined): boolean {
    if (!countryId) return false;
    const country = this.countries().find((c) => c.id === countryId);
    if (!country) return false;

    const code = (country.code || '').toString().trim().toUpperCase();
    if (code === 'VN' || code === 'VNM') return false;

    const nameVi = (country.name || '').toString().toLowerCase();
    const nameEn = (country.name_EN || '').toString().toLowerCase();
    return !nameVi.includes('viá»‡t nam') && !nameVi.includes('viet nam') && !nameEn.includes('vietnam');
  }

  // File upload handlers
  onPassportFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

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
            this.uploadedFiles.update((current) => [...current, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePassportFile(index: number): void {
    this.uploadedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  // Education file handlers
  onDegreeFileChange(event: any, type: string, index: number): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_SIZE_LIMIT')}`
          );
          continue;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_INVALID_TYPE')}`
          );
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
            if (type === EDUCATION_LEVELS.UNDERGRADUATE) {
              this.undergraduateFiles.update((current) => {
                const updated = [...current];
                if (!updated[index]) updated[index] = [];
                updated[index] = [...updated[index], ...newFiles];
                return updated;
              });
            } else {
              this.postgraduateFiles.update((current) => {
                const updated = [...current];
                if (!updated[index]) updated[index] = [];
                updated[index] = [...updated[index], ...newFiles];
                return updated;
              });
            }
            this.refreshEducationFileValidationIfNeeded();
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeDegreeFile(type: string, degreeIndex: number, fileIndex: number): void {
    if (type === EDUCATION_LEVELS.UNDERGRADUATE) {
      this.undergraduateFiles.update((files) => {
        const updated = [...files];
        if (updated[degreeIndex]) {
          updated[degreeIndex] = updated[degreeIndex].filter((_, i) => i !== fileIndex);
        }
        return updated;
      });
    } else {
      this.postgraduateFiles.update((files) => {
        const updated = [...files];
        if (updated[degreeIndex]) {
          updated[degreeIndex] = updated[degreeIndex].filter((_, i) => i !== fileIndex);
        }
        return updated;
      });
    }
    this.refreshEducationFileValidationIfNeeded();
  }

  // English qualification file handlers
  onEnglishFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_SIZE_LIMIT')}`
          );
          continue;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error(
            this._translate.instant('SUBMIT_RESULT.ERROR_TITLE'),
            `File ${file.name} ${this._translate.instant('FILE_DIALOG.FILE_INVALID_TYPE')}`
          );
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
            this.englishFiles.update((current) => [...current, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeEnglishFile(index: number): void {
    this.englishFiles.update((files) => files.filter((_, i) => i !== index));
  }

  // Handle file updates from view mode
  onViewFilesUpdate(files: any[]): void {
    this.uploadedFiles.set(files);
    // Optionally save to server immediately or wait for explicit save
  }

  onEducationFilesUpdate(event: { type: string; index: number; files: any[] }): void {
    if (event.type === EDUCATION_LEVELS.UNDERGRADUATE) {
      this.undergraduateFiles.update((current) => {
        const updated = [...current];
        updated[event.index] = event.files;
        return updated;
      });
    } else {
      this.postgraduateFiles.update((current) => {
        const updated = [...current];
        updated[event.index] = event.files;
        return updated;
      });
    }
    this.refreshEducationFileValidationIfNeeded();
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
      const selectedProvince = this.provinces().find((p) => p.provinceCode === provinceCode);
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
      const selectedWard = this.correspondenceWards().find((w) => w.wardCode === wardCode);
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
      const selectedProvince = this.provinces().find((p) => p.provinceCode === provinceCode);
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
      const selectedWard = this.permanentWards().find((w) => w.wardCode === wardCode);
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
    this.logSimpleGroupErrors(this.editForm.get('personalDetails') as FormGroup, 'Personal Details Errors');
    this.logSimpleGroupErrors(this.editForm.get('applicationDetails') as FormGroup, 'Application Details Errors');

    const educationDetails = this.editForm.get('educationDetails') as FormGroup;
    if (educationDetails?.invalid) {
      console.log('Education Details Errors:');
      this.logFormArrayErrors(educationDetails.get('undergraduates') as FormArray, 'Undergraduate');
      this.logFormArrayErrors(educationDetails.get('postgraduates') as FormArray, 'Postgraduate');
    }

    const englishQuals = this.editForm.get('englishQualifications') as FormGroup;
    if (englishQuals?.invalid) {
      console.log('English Qualifications Errors:');
      if (englishQuals.errors) console.log('  Group errors:', englishQuals.errors);
      ['ielts', 'toefl', 'other'].forEach((type) =>
        this.logNestedGroupErrors(englishQuals.get(type) as FormGroup, type)
      );
    }

    const empHistory = this.editForm.get('employmentHistory') as FormGroup;
    if (empHistory?.invalid) {
      console.log('Employment History Errors:');
      ['position1', 'position2'].forEach((pos) =>
        this.logNestedGroupErrors(empHistory.get(pos) as FormGroup, pos, true)
      );
    }

    console.log('=== END VALIDATION ERRORS ===');
  }

  private logSimpleGroupErrors(group: FormGroup, title: string): void {
    if (group?.invalid) {
      console.log(`${title}:`);
      Object.keys(group.controls).forEach((key) => {
        const control = group.get(key);
        if (control?.invalid) console.log(`  - ${key}:`, control.errors);
      });
    }
  }

  private logFormArrayErrors(array: FormArray, prefix: string): void {
    if (array?.invalid) {
      array.controls.forEach((control, index) => {
        if (control.invalid) {
          console.log(`  ${prefix} ${index}:`);
          const group = control as FormGroup;
          Object.keys(group.controls).forEach((key) => {
            const field = group.get(key);
            if (field?.invalid) console.log(`    - ${key}:`, field.errors, 'Value:', field.value);
          });
        }
      });
    }
  }

  private logNestedGroupErrors(group: FormGroup, title: string, checkGroupErrors = false): void {
    if (group?.invalid) {
      console.log(`  ${title}:`);
      if (checkGroupErrors && group.errors) console.log(`    Group errors:`, group.errors);
      Object.keys(group.controls).forEach((key) => {
        const control = group.get(key);
        if (control?.invalid) console.log(`    - ${key}:`, control.errors);
      });
    }
  }
}
