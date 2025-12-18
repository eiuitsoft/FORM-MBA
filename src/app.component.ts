
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MbaService } from './app/core/services/mba/mba.service';
import { uniqueFieldValidator } from './validators/unique-field.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private readonly _mbaService = inject(MbaService);
  
  submitted = signal(false);
  showDialog = signal(false);
  dialogMessage = signal('');
  dialogType = signal<'success' | 'error'>('success');
  
  applicationForm: FormGroup = this.fb.group({
    personalDetails: this.fb.group({
      fullName: ['', Validators.required],
      nationality: ['', Validators.required],
      gender: ['Male', Validators.required],
      dateOfBirth: ['', Validators.required],
      placeOfBirth: ['', Validators.required],
      passportNo: [
        '', 
        [Validators.required],
        [uniqueFieldValidator(
          (val) => this._mbaService.checkPassportExists(val),
          'passportExists'
        )]
      ],
      dateIssued: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '', 
        [Validators.required],
        [uniqueFieldValidator(
          (val) => this._mbaService.checkMobileExists(val),
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
      programCode: [''],
      track: ['Application', Validators.required],
      admissionYear: ['', Validators.required],
      admissionIntake: [''],
    }),
    educationDetails: this.fb.group({
      undergraduate: this.fb.group({
        university: ['', Validators.required],
        country: ['', Validators.required],
        major: ['', Validators.required],
        graduationYear: ['', Validators.required],
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
      ielts: this.fb.group({ score: [''], date: [''] }),
      toefl: this.fb.group({ score: [''], date: [''] }),
      other: this.fb.group({ name: [''], score: [''], date: [''] }),
    }),
    employmentHistory: this.fb.group({
      position1: this.fb.group({
        organization: ['', Validators.required],
        title: ['', Validators.required],
        from: ['', Validators.required],
        to: ['', Validators.required],
        address: ['', Validators.required],
      }),
      position2: this.fb.group({
        organization: [''],
        title: [''],
        from: [''],
        to: [''],
        address: [''],
      }),
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

  // Helper to easily access nested form groups in the template
  get personalDetails() { return this.applicationForm.get('personalDetails') as FormGroup; }
  get applicationDetails() { return this.applicationForm.get('applicationDetails') as FormGroup; }
  get educationDetails() { return this.applicationForm.get('educationDetails') as FormGroup; }
  get englishQualifications() { return this.applicationForm.get('englishQualifications') as FormGroup; }
  get employmentHistory() { return this.applicationForm.get('employmentHistory') as FormGroup; }
  get declaration() { return this.applicationForm.get('declaration') as FormGroup; }
}
