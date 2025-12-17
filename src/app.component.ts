
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private fb = inject(FormBuilder);
  
  submitted = signal(false);
  
  applicationForm: FormGroup = this.fb.group({
    personalDetails: this.fb.group({
      fullName: ['', Validators.required],
      nationality: ['', Validators.required],
      gender: ['Male', Validators.required],
      dateOfBirth: ['', Validators.required],
      placeOfBirth: ['', Validators.required],
      passportNo: ['', Validators.required],
      dateIssued: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      jobTitle: [''],
      organization: [''],
      correspondenceAddress: ['', Validators.required],
      permanentAddress: ['', Validators.required],
    }),
    applicationDetails: this.fb.group({
      programName: ['Master of Business Administration'],
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
      console.log('Form Submitted!', this.applicationForm.value);
      alert('Application submitted successfully!');
    } else {
      console.error('Form is invalid.');
      alert('Please fill out all required fields before submitting.');
    }
  }

  // Helper to easily access nested form groups in the template
  get personalDetails() { return this.applicationForm.get('personalDetails') as FormGroup; }
  get applicationDetails() { return this.applicationForm.get('applicationDetails') as FormGroup; }
  get educationDetails() { return this.applicationForm.get('educationDetails') as FormGroup; }
  get englishQualifications() { return this.applicationForm.get('englishQualifications') as FormGroup; }
  get employmentHistory() { return this.applicationForm.get('employmentHistory') as FormGroup; }
  get declaration() { return this.applicationForm.get('declaration') as FormGroup; }
}
