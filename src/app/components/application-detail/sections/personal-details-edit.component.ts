import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-personal-details-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule, FileManagerDialogComponent],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION A - PERSONAL DETAILS</h3>
      </div>
      <div class="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Full Name <span class="text-red-600">*</span></label>
          <input type="text" formControlName="fullName" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
          @if (formGroup.get('fullName')?.hasError('required') && formGroup.get('fullName')?.touched) {
            <p class="text-red-600 text-sm mt-1">Full name is required</p>
          }
          @if (formGroup.get('fullName')?.hasError('minlength') && formGroup.get('fullName')?.touched) {
            <p class="text-red-600 text-sm mt-1">Full name must be at least 2 characters</p>
          }
        </div>

        <!-- Nationality -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Nationality <span class="text-red-600">*</span></label>
          <select formControlName="nationalityId" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
            <option value="">-- Select --</option>
            @for (country of countries; track country.id) {
              <option [value]="country.id">{{ country.name }}</option>
            }
          </select>
          @if (formGroup.get('nationalityId')?.hasError('required') && formGroup.get('nationalityId')?.touched) {
            <p class="text-red-600 text-sm mt-1">Nationality is required</p>
          }
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Gender <span class="text-red-600">*</span></label>
          <select formControlName="gender" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
            <option value="1">Male</option>
            <option value="0">Female</option>
          </select>
        </div>

        <!-- Date of Birth -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Date of Birth <span class="text-red-600">*</span></label>
          <input type="date" formControlName="dateOfBirth" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
          @if (formGroup.get('dateOfBirth')?.hasError('required') && formGroup.get('dateOfBirth')?.touched) {
            <p class="text-red-600 text-sm mt-1">Date of birth is required</p>
          }
          @if (formGroup.get('dateOfBirth')?.hasError('minAge') && formGroup.get('dateOfBirth')?.touched) {
            <p class="text-red-600 text-sm mt-1">You must be at least 18 years old</p>
          }
        </div>

        <!-- Place of Birth -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Place of Birth <span class="text-red-600">*</span></label>
          <input type="text" formControlName="placeOfBirth" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
          @if (formGroup.get('placeOfBirth')?.hasError('required') && formGroup.get('placeOfBirth')?.touched) {
            <p class="text-red-600 text-sm mt-1">Place of Birth is required</p>
          }
        </div>

        <!-- Passport No -->
        <div>
          <label class="block text-sm font-medium text-gray-700">ID/Passport No. <span class="text-red-600">*</span></label>
          <div class="relative">
            <input type="text" formControlName="passportNo" 
                   (input)="formatPassportInput($event)"
                   placeholder="Enter ID or Passport number"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 pr-10">
            @if (formGroup.get('passportNo')?.pending) {
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            }
            @if (formGroup.get('passportNo')?.valid && formGroup.get('passportNo')?.touched && !formGroup.get('passportNo')?.pending) {
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            }
          </div>
          @if (formGroup.get('passportNo')?.hasError('required') && formGroup.get('passportNo')?.touched) {
            <p class="text-red-600 text-sm mt-1">ID/Passport is required</p>
          }
          @if (formGroup.get('passportNo')?.hasError('minlength') || formGroup.get('passportNo')?.hasError('maxlength')) {
            <p class="text-red-600 text-sm mt-1">ID/Passport must be 6-12 characters</p>
          }
          @if (formGroup.get('passportNo')?.hasError('invalidFormat')) {
            <p class="text-red-600 text-sm mt-1">ID/Passport can only contain letters and numbers</p>
          }
          @if (formGroup.get('passportNo')?.hasError('passportExists') && formGroup.get('passportNo')?.touched) {
            <p class="text-red-600 text-sm mt-1">This ID/Passport number is already registered</p>
          }
        </div>

        <!-- Date Issued -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Date Issued <span class="text-red-600">*</span></label>
          <input type="date" formControlName="dateIssued" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
          @if (formGroup.get('dateIssued')?.hasError('required') && formGroup.get('dateIssued')?.touched) {
            <p class="text-red-600 text-sm mt-1">Date Issued is required</p>
          }
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Email <span class="text-red-600">*</span></label>
          <div class="relative">
            <input type="email" formControlName="email" 
                   (input)="formatEmailInput($event)"
                   placeholder="example@domain.com"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 pr-10">
            @if (formGroup.get('email')?.valid && formGroup.get('email')?.touched) {
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            }
          </div>
          @if (formGroup.get('email')?.hasError('required') && formGroup.get('email')?.touched) {
            <p class="text-red-600 text-sm mt-1">Email is required</p>
          }
          @if ((formGroup.get('email')?.hasError('email') || formGroup.get('email')?.hasError('invalidEmailFormat')) && formGroup.get('email')?.touched) {
            <p class="text-red-600 text-sm mt-1">Please enter a valid email address</p>
          }
          @if (formGroup.get('email')?.hasError('invalidDomain') && formGroup.get('email')?.touched) {
            <p class="text-red-600 text-sm mt-1">Email domain is invalid</p>
          }
        </div>

        <!-- Mobile -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Mobile <span class="text-red-600">*</span></label>
          <ngx-intl-tel-input
            [cssClass]="'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2'"
            [preferredCountries]="['vn', 'us', 'gb']"
            [enableAutoCountrySelect]="true"
            [enablePlaceholder]="true"
            [searchCountryFlag]="true"
            [searchCountryField]="['name', 'dialCode']"
            [selectFirstCountry]="false"
            [selectedCountryISO]="'vn'"
            [maxLength]="15"
            [phoneValidation]="true"
            [separateDialCode]="true"
            formControlName="mobile">
          </ngx-intl-tel-input>
          @if (formGroup.get('mobile')?.pending) {
            <div class="flex items-center mt-1">
              <svg class="animate-spin h-4 w-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm text-gray-500">Checking...</span>
            </div>
          }
          @if (formGroup.get('mobile')?.valid && formGroup.get('mobile')?.touched && !formGroup.get('mobile')?.pending) {
            <div class="flex items-center mt-1">
              <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-green-600">Valid number</span>
            </div>
          }
          @if (formGroup.get('mobile')?.hasError('validatePhoneNumber') && formGroup.get('mobile')?.touched) {
            <p class="text-red-600 text-sm mt-1">Please enter a valid phone number</p>
          }
          @if (formGroup.get('mobile')?.hasError('required') && formGroup.get('mobile')?.touched) {
            <p class="text-red-600 text-sm mt-1">Mobile is required</p>
          }
          @if (formGroup.get('mobile')?.hasError('mobileExists') && formGroup.get('mobile')?.touched) {
            <p class="text-red-600 text-sm mt-1">This mobile number is already registered</p>
          }
        </div>

        <!-- Job Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Job Title <span class="text-red-600">*</span></label>
          <input type="text" formControlName="jobTitle" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
          @if (formGroup.get('jobTitle')?.hasError('required') && formGroup.get('jobTitle')?.touched) {
            <p class="text-red-600 text-sm mt-1">Job title is required</p>
          }
        </div>

        <!-- Organization -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Organization <span class="text-red-600">*</span></label>
          <input type="text" formControlName="organization" 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
          @if (formGroup.get('organization')?.hasError('required') && formGroup.get('organization')?.touched) {
            <p class="text-red-600 text-sm mt-1">Organization is required</p>
          }
        </div>

        <!-- Correspondence Address -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Correspondence Address <span class="text-red-600">*</span></label>
          <textarea formControlName="correspondenceAddress" rows="2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2"></textarea>
          @if (formGroup.get('correspondenceAddress')?.hasError('required') && formGroup.get('correspondenceAddress')?.touched) {
            <p class="text-red-600 text-sm mt-1">Correspondence Address is required</p>
          }
        </div>

        <!-- Permanent Address -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Permanent Address <span class="text-red-600">*</span></label>
          <textarea formControlName="permanentAddress" rows="2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2"></textarea>
          @if (formGroup.get('permanentAddress')?.hasError('required') && formGroup.get('permanentAddress')?.touched) {
            <p class="text-red-600 text-sm mt-1">Permanent Address is required</p>
          }
        </div>

        <!-- Passport File Upload -->
        <div class="md:col-span-4">
          <label class="block text-xs font-medium text-gray-600 mb-2">Upload ID/Passport Document</label>
          <button type="button" (click)="openFileManager()" 
                  class="w-full flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <svg class="w-6 h-6 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm text-gray-600">
              {{ uploadedFiles && uploadedFiles.length > 0 ? uploadedFiles.length + ' file(s) uploaded - Click to manage' : 'Click to upload files' }}
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1">Upload single or multiple files (PDF, JPG, or PNG, max 5MB per file)</p>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="'Quản lý tệp ID/Passport'"
      [(files)]="uploadedFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class PersonalDetailsEditComponent {
  @Input() formGroup!: FormGroup;
  @Input() countries: any[] = [];
  @Input() uploadedFiles: any[] = [];
  @Input() onFileChange!: (event: any) => void;
  @Input() onRemoveFile!: (index: number) => void;
  @Output() onPassportChange = new EventEmitter<string>();
  @Output() onMobileChange = new EventEmitter<any>();

  isFileManagerOpen = false;

  openFileManager(): void {
    this.isFileManagerOpen = true;
  }

  onFilesSaved(files: any[]): void {
    this.uploadedFiles = files;
  }

  formatPassportInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.formGroup.get('passportNo')?.setValue(input.value, { emitEvent: false });
  }

  formatEmailInput(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toLowerCase();
    this.formGroup.get('email')?.setValue(input.value, { emitEvent: false });
  }
}
