import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-personal-details-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule, FileManagerDialogComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.PERSONAL' | translate }}</h3>
      </div>
      <div class="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.FULL_NAME' | translate }} <span class="text-red-600">*</span></label
          >
          <input
            type="text"
            formControlName="fullName"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('fullName')?.hasError('required') && formGroup.get('fullName')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.FULL_NAME' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          } @if (formGroup.get('fullName')?.hasError('minlength') && formGroup.get('fullName')?.touched) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.FULL_NAME_MIN' | translate }}</p>
          }
        </div>

        <!-- Nationality -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.NATIONALITY' | translate }} <span class="text-red-600">*</span></label
          >
          <select
            formControlName="nationalityId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
            <option value="">{{ 'COMMON.SELECT_DEFAULT' | translate }}</option>
            @for (country of countries; track country.id) {
            <option [value]="country.id">{{ isLangVi ? country.name : country.name_EN }}</option>
            }
          </select>
          @if (formGroup.get('nationalityId')?.hasError('required') && formGroup.get('nationalityId')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.NATIONALITY' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.GENDER' | translate }} <span class="text-red-600">*</span></label
          >
          <select
            formControlName="gender"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
            <option value="1">{{ 'PERSONAL_DETAILS.MALE' | translate }}</option>
            <option value="2">{{ 'PERSONAL_DETAILS.FEMALE' | translate }}</option>
          </select>
        </div>

        <!-- Date of Birth -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.DOB' | translate }} <span class="text-red-600">*</span></label
          >
          <input
            type="date"
            formControlName="dateOfBirth"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('dateOfBirth')?.hasError('required') && formGroup.get('dateOfBirth')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.DOB' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          } @if (formGroup.get('dateOfBirth')?.hasError('minAge') && formGroup.get('dateOfBirth')?.touched) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.MIN_AGE' | translate }}</p>
          }
        </div>

        <!-- Place of Birth -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.POB' | translate }} <span class="text-red-600">*</span></label
          >
          <input
            type="text"
            formControlName="placeOfBirth"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('placeOfBirth')?.hasError('required') && formGroup.get('placeOfBirth')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.POB' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Passport No -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.PASSPORT' | translate }} <span class="text-red-600">*</span></label
          >
          <div class="relative">
            <input
              type="text"
              formControlName="passportNo"
              (input)="formatPassportInput($event)"
              [placeholder]="'PERSONAL_DETAILS.PASSPORT_PLACEHOLDER' | translate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 pr-10" />
            @if (formGroup.get('passportNo')?.pending) {
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                class="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            } @if (formGroup.get('passportNo')?.valid && formGroup.get('passportNo')?.touched &&
            !formGroup.get('passportNo')?.pending) {
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            }
          </div>
          @if (formGroup.get('passportNo')?.hasError('required') && formGroup.get('passportNo')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.PASSPORT' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          } @if (formGroup.get('passportNo')?.hasError('minlength') ||
          formGroup.get('passportNo')?.hasError('maxlength')) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.PASSPORT_LENGTH' | translate }}</p>
          } @if (formGroup.get('passportNo')?.hasError('invalidFormat')) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.PASSPORT_FORMAT' | translate }}</p>
          } @if (formGroup.get('passportNo')?.hasError('passportExists') && formGroup.get('passportNo')?.touched) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.PASSPORT_EXISTS' | translate }}</p>
          }
        </div>

        <!-- Date Issued -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.DATE_ISSUED' | translate }} <span class="text-red-600">*</span></label
          >
          <input
            type="date"
            formControlName="dateIssued"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('dateIssued')?.hasError('required') && formGroup.get('dateIssued')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.DATE_ISSUED' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Place of Issue -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            {{ 'PERSONAL_DETAILS.PLACE_OF_ISSUE' | translate }} <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            formControlName="passportPlaceIssued"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('passportPlaceIssued')?.hasError('required') &&
          formGroup.get('passportPlaceIssued')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.PLACE_OF_ISSUE' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.EMAIL' | translate }} <span class="text-red-600">*</span></label
          >
          <div class="relative">
            <input
              type="email"
              formControlName="email"
              (input)="formatEmailInput($event)"
              placeholder="example@domain.com"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 pr-10" />
            @if (formGroup.get('email')?.valid && formGroup.get('email')?.touched) {
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            }
          </div>
          @if (formGroup.get('email')?.hasError('required') && formGroup.get('email')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.EMAIL' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          } @if ((formGroup.get('email')?.hasError('email') || formGroup.get('email')?.hasError('invalidEmailFormat'))
          && formGroup.get('email')?.touched) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.EMAIL_INVALID' | translate }}</p>
          } @if (formGroup.get('email')?.hasError('invalidDomain') && formGroup.get('email')?.touched) {
          <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.EMAIL_DOMAIN_INVALID' | translate }}</p>
          }
        </div>

        <!-- Mobile -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.MOBILE' | translate }} <span class="text-red-600">*</span></label
          >
          <div class="mt-1">
            <ngx-intl-tel-input
              [cssClass]="
                'block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2'
              "
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
              <svg
                class="animate-spin h-4 w-4 text-gray-400 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm text-gray-500">{{ 'COMMON.CHECKING' | translate }}</span>
            </div>
            } @if (formGroup.get('mobile')?.valid && formGroup.get('mobile')?.touched &&
            !formGroup.get('mobile')?.pending) {
            <div class="flex items-center mt-1">
              <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-green-600">{{ 'COMMON.VALID_NUMBER' | translate }}</span>
            </div>
            } @if (formGroup.get('mobile')?.hasError('validatePhoneNumber') && formGroup.get('mobile')?.touched) {
            <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.MOBILE_INVALID' | translate }}</p>
            } @if (formGroup.get('mobile')?.hasError('required') && formGroup.get('mobile')?.touched) {
            <p class="text-red-600 text-sm mt-1">
              {{ 'PERSONAL_DETAILS.MOBILE' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
            </p>
            } @if (formGroup.get('mobile')?.hasError('mobileExists') && formGroup.get('mobile')?.touched) {
            <p class="text-red-600 text-sm mt-1">{{ 'PERSONAL_DETAILS.MOBILE_EXISTS' | translate }}</p>
            }
          </div>
        </div>

        <!-- Job Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.JOB_TITLE' | translate }} <span class="text-red-600">*</span></label
          >
          <input
            type="text"
            formControlName="jobTitle"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('jobTitle')?.hasError('required') && formGroup.get('jobTitle')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.JOB_TITLE' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Organization -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.ORGANIZATION' | translate }} <span class="text-red-600">*</span></label
          >
          <input
            type="text"
            formControlName="organization"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2" />
          @if (formGroup.get('organization')?.hasError('required') && formGroup.get('organization')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.ORGANIZATION' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Correspondence City & District -->
        <div class="md:col-span-2">
          <div class="grid grid-cols-2 gap-x-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{
                'PERSONAL_DETAILS.CORR_CITY' | translate
              }}</label>
              <select
                formControlName="correspondenceCityId"
                (change)="correspondenceProvinceChange.emit($event)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
                <option value="">{{ 'COMMON.SELECT_CITY' | translate }}</option>
                @for (province of provinces; track province.provinceCode) {
                <option [value]="province.provinceCode">{{ province.provinceName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">{{
                'PERSONAL_DETAILS.CORR_WARD' | translate
              }}</label>
              <select
                formControlName="correspondenceDistrictId"
                (change)="correspondenceWardChange.emit($event)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
                <option value="">{{ 'COMMON.SELECT_WARD' | translate }}</option>
                @for (ward of correspondenceWards; track ward.wardCode) {
                <option [value]="ward.wardCode">{{ ward.wardName }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Correspondence Address -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.CORR_ADDRESS' | translate }} <span class="text-red-600">*</span></label
          >
          <textarea
            formControlName="correspondenceAddress"
            rows="2"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2"></textarea>
          @if (formGroup.get('correspondenceAddress')?.hasError('required') &&
          formGroup.get('correspondenceAddress')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.CORR_ADDRESS' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Permanent City & District -->
        <div class="md:col-span-2">
          <div class="grid grid-cols-2 gap-x-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{
                'PERSONAL_DETAILS.PERM_CITY' | translate
              }}</label>
              <select
                formControlName="permanentCityId"
                (change)="permanentProvinceChange.emit($event)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
                <option value="">{{ 'COMMON.SELECT_CITY' | translate }}</option>
                @for (province of provinces; track province.provinceCode) {
                <option [value]="province.provinceCode">{{ province.provinceName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">{{
                'PERSONAL_DETAILS.PERM_WARD' | translate
              }}</label>
              <select
                formControlName="permanentDistrictId"
                (change)="permanentWardChange.emit($event)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2">
                <option value="">{{ 'COMMON.SELECT_WARD' | translate }}</option>
                @for (ward of permanentWards; track ward.wardCode) {
                <option [value]="ward.wardCode">{{ ward.wardName }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Permanent Address -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700"
            >{{ 'PERSONAL_DETAILS.PERM_ADDRESS' | translate }} <span class="text-red-600">*</span></label
          >
          <textarea
            formControlName="permanentAddress"
            rows="2"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2"></textarea>
          @if (formGroup.get('permanentAddress')?.hasError('required') && formGroup.get('permanentAddress')?.touched) {
          <p class="text-red-600 text-sm mt-1">
            {{ 'PERSONAL_DETAILS.PERM_ADDRESS' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}
          </p>
          }
        </div>

        <!-- Passport File Upload -->
        <div class="md:col-span-4">
          <label class="block text-xs font-medium text-gray-600 mb-2">{{
            'PERSONAL_DETAILS.UPLOAD_PASSPORT' | translate
          }}</label>
          <button
            type="button"
            (click)="openFileManager()"
            [class]="
              uploadedFiles && uploadedFiles.length > 0
                ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'
            ">
            <svg
              class="w-5 h-5 mr-2"
              [class]="uploadedFiles && uploadedFiles.length > 0 ? 'text-green-600' : 'text-blue-500'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span
              class="text-sm font-medium"
              [class]="uploadedFiles && uploadedFiles.length > 0 ? 'text-green-700' : 'text-blue-700'">
              {{
                uploadedFiles && uploadedFiles.length > 0
                  ? uploadedFiles.length + ' ' + ('COMMON.FILE_SELECTED' | translate)
                  : ('COMMON.FILE_UPLOAD' | translate)
              }}
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</p>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="dialogTitle"
      [fileCategoryId]="1"
      [entityId]="getPersonalDetailsEntityId()"
      [(files)]="uploadedFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class PersonalDetailsEditComponent {
  private readonly translate = inject(TranslateService);

  @Input() formGroup!: FormGroup;
  @Input() countries: any[] = [];
  @Input() provinces: any[] = [];
  @Input() correspondenceWards: any[] = [];
  @Input() permanentWards: any[] = [];
  @Input() uploadedFiles: any[] = [];
  @Input() onFileChange!: (event: any) => void;
  @Input() onRemoveFile!: (index: number) => void;
  @Output() correspondenceProvinceChange = new EventEmitter<Event>();
  @Output() correspondenceWardChange = new EventEmitter<Event>();
  @Output() permanentProvinceChange = new EventEmitter<Event>();
  @Output() permanentWardChange = new EventEmitter<Event>();

  isFileManagerOpen = false;
  dialogTitle = '';

  get isLangVi(): boolean {
    return (localStorage.getItem('lang') || 'vi') === 'vi';
  }

  openFileManager(): void {
    this.dialogTitle = this.translate.instant('FILE_DIALOG.TITLE_PASSPORT');
    this.isFileManagerOpen = true;
  }

  /**
   * Get entity ID for personal details
   * Personal details doesn't have a separate entity ID in the form,
   * so we return undefined (files will be associated with studentId only)
   */
  getPersonalDetailsEntityId(): string | undefined {
    // Personal details files are associated with studentId, not a separate entity
    return undefined;
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
