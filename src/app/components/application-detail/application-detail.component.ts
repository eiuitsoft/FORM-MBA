import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MbaService } from '../../core/services/mba/mba.service';
import { AlertService } from '../../core/services/alert/alert.service';
import { PageLayoutComponent } from '../layouts/page-layout/page-layout.component';
import { PersonalDetailsViewComponent } from './sections/personal-details-view.component';
import { PersonalDetailsEditComponent } from './sections/personal-details-edit.component';
import { ApplicationDetailsViewComponent } from './sections/application-details-view.component';
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
    PageLayoutComponent,
    PersonalDetailsViewComponent,
    PersonalDetailsEditComponent,
    ApplicationDetailsViewComponent,
    EducationDetailsViewComponent,
    EducationDetailsEditComponent,
    EnglishQualificationsViewComponent,
    EnglishQualificationsEditComponent,
    EmploymentHistoryViewComponent,
    EmploymentHistoryEditComponent
  ],
  templateUrl: './application-detail.component.html'
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
  isEditMode = signal(false);
  applicationData = signal<any>(null);
  uploadedFiles = signal<any[]>([]);
  undergraduateFiles = signal<any[][]>([]);
  postgraduateFiles = signal<any[][]>([]);
  englishFiles = signal<any[]>([]);
  
  // Dropdown data
  countries = signal<any[]>([]);
  languages = signal<any[]>([]);
  
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

    this._mbaService.getById(id).subscribe({
      next: (data) => {
        this.applicationData.set(data);
        this.uploadedFiles.set(data.personalDetails?.uploadedFiles || []);
        this.loading.set(false);
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
  }

  toggleEditMode(): void {
    this.isEditMode.set(true);
    const data = this.applicationData();
    
    // Initialize uploaded files
    this.uploadedFiles.set(data?.personalDetails?.uploadedFiles || []);
    
    // Initialize education files
    const ugFiles: any[][] = [];
    const pgFiles: any[][] = [];
    
    data?.educationDetails?.undergraduates?.forEach((ug: any) => {
      ugFiles.push(ug.uploadedFiles || []);
    });
    
    data?.educationDetails?.postgraduates?.forEach((pg: any) => {
      pgFiles.push(pg.uploadedFiles || []);
    });
    
    this.undergraduateFiles.set(ugFiles);
    this.postgraduateFiles.set(pgFiles);
    
    // Initialize english files (combine all)
    const allEnglishFiles = [
      ...(data?.englishQualifications?.ielts?.uploadedFiles || []),
      ...(data?.englishQualifications?.toefl?.uploadedFiles || []),
      ...(data?.englishQualifications?.other?.uploadedFiles || [])
    ];
    this.englishFiles.set(allEnglishFiles);
    
    this.initializeEditForm();
  }

  private initializeEditForm(): void {
    const data = this.applicationData();
    const originalPassport = data.personalDetails.passportNo;
    const originalMobile = data.personalDetails.mobile;
    
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
        correspondenceAddress: [data.personalDetails.correspondenceAddress, Validators.required],
        permanentAddress: [data.personalDetails.permanentAddress, Validators.required],
      }),
      educationDetails: this._fb.group({
        undergraduates: this._fb.array(
          data.educationDetails.undergraduates.map((ug: any, index: number) => this._fb.group({
            id: [ug.id],
            university: [ug.university, index === 0 ? Validators.required : null],
            countryId: [ug.countryId, index === 0 ? Validators.required : null],
            major: [ug.major, index === 0 ? Validators.required : null],
            graduationYear: [ug.graduationYear, index === 0 ? [Validators.required, minYearValidator(1950)] : minYearValidator(1950)],
            languageId: [ug.languageId, index === 0 ? Validators.required : null],
            thesisTitle: [ug.thesisTitle]
          }))
        ),
        postgraduates: this._fb.array(
          data.educationDetails.postgraduates.map((pg: any) => this._fb.group({
            id: [pg.id],
            university: [pg.university],
            countryId: [pg.countryId],
            major: [pg.major],
            graduationYear: [pg.graduationYear, minYearValidator(1950)],
            languageId: [pg.languageId],
            thesisTitle: [pg.thesisTitle]
          }))
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
      this._alertService.error('Error', 'Please fill in all required fields');
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
        this._alertService.error('Error', 'An error occurred while updating the application');
        this.saving.set(false);
      }
    });
  }

  private transformFormData(): any {
    const rawValue = this.editForm.getRawValue();
    const data = this.applicationData();

    return {
      id: this.applicationId(),
      personalDetails: {
        id: data.personalDetails.id,
        ...rawValue.personalDetails,
        nationalityName: this.countries().find(c => c.id === rawValue.personalDetails.nationalityId)?.name || '',
        uploadedFiles: this.uploadedFiles()
      },
      applicationDetails: data.applicationDetails,
      educationDetails: {
        undergraduates: rawValue.educationDetails.undergraduates.map((ug: any, index: number) => ({
          ...ug,
          countryName: this.countries().find(c => c.id === ug.countryId)?.name || '',
          languageName: this.languages().find(l => l.id === ug.languageId)?.name || '',
          uploadedFiles: this.undergraduateFiles()[index] || [],
          sortOrder: index
        })),
        postgraduates: rawValue.educationDetails.postgraduates.map((pg: any, index: number) => ({
          ...pg,
          countryName: this.countries().find(c => c.id === pg.countryId)?.name || '',
          languageName: this.languages().find(l => l.id === pg.languageId)?.name || '',
          uploadedFiles: this.postgraduateFiles()[index] || [],
          sortOrder: index
        }))
      },
      englishQualifications: {
        ielts: rawValue.englishQualifications.ielts.score ? {
          ...rawValue.englishQualifications.ielts,
          name: 'IELTS',
          uploadedFiles: this.englishFiles()
        } : undefined,
        toefl: rawValue.englishQualifications.toefl.score ? {
          ...rawValue.englishQualifications.toefl,
          name: 'TOEFL',
          uploadedFiles: this.englishFiles()
        } : undefined,
        other: rawValue.englishQualifications.other.name ? {
          ...rawValue.englishQualifications.other,
          uploadedFiles: this.englishFiles()
        } : undefined
      },
      employmentHistory: {
        position1: rawValue.employmentHistory.position1.organizationName ? rawValue.employmentHistory.position1 : undefined,
        position2: rawValue.employmentHistory.position2.organizationName ? rawValue.employmentHistory.position2 : undefined
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
}
