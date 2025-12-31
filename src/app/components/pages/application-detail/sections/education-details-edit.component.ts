import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-education-details-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileManagerDialogComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.EDUCATION' | translate }}</h3>
      </div>
      
      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Undergraduate Degrees -->
        <div class="mb-8" formArrayName="undergraduates">
          <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">{{ 'EDUCATION_DETAILS.UNDERGRAD_TITLE' | translate }}</h4>
          @for (degree of undergraduates.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
              <div class="flex justify-between items-center mb-3">
                <p class="text-sm font-bold text-[#a68557] uppercase">
                  @if (i === 0) { {{ 'EDUCATION_DETAILS.UNDERGRAD_TITLE' | translate }} }
                  @else if (i === 1) { {{ 'EDUCATION_DETAILS.SECOND_DEGREE' | translate }} }
                  @else { {{ i + 1 }}{{ 'EDUCATION_DETAILS.OTHER_DEGREE' | translate }} }
                </p>
                @if (i > 1) {
                  <button type="button" (click)="removeUndergraduate(i)" class="text-red-600 hover:text-red-800 text-sm font-medium">✕ {{ 'COMMON.REMOVE' | translate }}</button>
                }
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.UNIVERSITY' | translate }} @if (i === 0) { <span class="text-red-600">*</span> }</label>
                  <input type="text" formControlName="university" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                  @if (i === 0 && degree.get('university')?.hasError('required') && degree.get('university')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.UNIVERSITY' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.COUNTRY' | translate }} @if (i === 0) { <span class="text-red-600">*</span> }</label>
                  <select formControlName="countryId" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                    <option value="">{{ 'COMMON.SELECT_DEFAULT' | translate }}</option>
                    @for (country of countries; track country.id) {
                      <option [value]="country.id">{{ country.name }}</option>
                    }
                  </select>
                  @if (i === 0 && degree.get('countryId')?.hasError('required') && degree.get('countryId')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.COUNTRY' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.MAJOR' | translate }} @if (i === 0) { <span class="text-red-600">*</span> }</label>
                  <input type="text" formControlName="major" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                  @if (i === 0 && degree.get('major')?.hasError('required') && degree.get('major')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.MAJOR' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR' | translate }} @if (i === 0) { <span class="text-red-600">*</span> }</label>
                  <input type="number" formControlName="graduationYear" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                  @if (i === 0 && degree.get('graduationYear')?.hasError('required') && degree.get('graduationYear')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}</p>
                  }
                  @if (degree.get('graduationYear')?.hasError('minYear') && degree.get('graduationYear')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR_MIN' | translate }}</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.LANGUAGE' | translate }} @if (i === 0) { <span class="text-red-600">*</span> }</label>
                  <select formControlName="languageId" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                    <option value="">{{ 'COMMON.SELECT_DEFAULT' | translate }}</option>
                    @for (lang of languages; track lang.id) {
                      <option [value]="lang.id">{{ lang.name }}</option>
                    }
                  </select>
                  @if (i === 0 && degree.get('languageId')?.hasError('required') && degree.get('languageId')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.LANGUAGE' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}</p>
                  }
                </div>
              </div>
              
              <!-- Upload section -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-2">{{ 'EDUCATION_DETAILS.UPLOAD_CERT' | translate }}</label>
                <button type="button" (click)="openFileManager('undergraduate', i)" 
                        [class]="undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0
                          ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                          : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
                  <svg class="w-5 h-5 mr-2" [class]="undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span class="text-sm font-medium" [class]="undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? 'text-green-700' : 'text-blue-700'">
                    {{ undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? (undergraduateFiles[i].length + ' ' + ('COMMON.FILE_SELECTED' | translate)) : ('COMMON.FILE_UPLOAD' | translate) }}
                  </span>
                </button>
                <p class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</p>
              </div>
            </div>
          }
          <button type="button" (click)="addUndergraduate()" class="mt-4 px-4 py-2 bg-[#a68557] text-white rounded-md hover:bg-[#8b6d47] font-semibold text-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'EDUCATION_DETAILS.ADD_UNDERGRAD' | translate }}
          </button>
        </div>

        <!-- Postgraduate Degrees -->
        <div formArrayName="postgraduates">
          <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">{{ 'EDUCATION_DETAILS.POSTGRAD_TITLE' | translate }}</h4>
          @for (degree of postgraduates.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
              <div class="flex justify-between items-center mb-3">
                <p class="text-sm font-bold text-[#a68557] uppercase">
                  @if (i === 0) { {{ 'EDUCATION_DETAILS.POSTGRAD_TITLE' | translate }} }
                  @else { {{ i + 1 }}{{ 'EDUCATION_DETAILS.OTHER_POSTGRAD' | translate }} }
                </p>
                @if (i > 0) {
                  <button type="button" (click)="removePostgraduate(i)" class="text-red-600 hover:text-red-800 text-sm font-medium">✕ {{ 'COMMON.REMOVE' | translate }}</button>
                }
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.UNIVERSITY' | translate }}</label>
                  <input type="text" formControlName="university" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.COUNTRY' | translate }}</label>
                  <select formControlName="countryId" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                    <option value="">{{ 'COMMON.SELECT_DEFAULT' | translate }}</option>
                    @for (country of countries; track country.id) {
                      <option [value]="country.id">{{ country.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.MAJOR' | translate }}</label>
                  <input type="text" formControlName="major" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR' | translate }}</label>
                  <input type="number" formControlName="graduationYear" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                  @if (degree.get('graduationYear')?.hasError('minYear') && degree.get('graduationYear')?.touched) {
                    <p class="text-red-600 text-xs mt-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR_MIN' | translate }}</p>
                  }
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.LANGUAGE' | translate }}</label>
                  <select formControlName="languageId" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                    <option value="">{{ 'COMMON.SELECT_DEFAULT' | translate }}</option>
                    @for (lang of languages; track lang.id) {
                      <option [value]="lang.id">{{ lang.name }}</option>
                    }
                  </select>
                </div>
                <div class="md:col-span-3">
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.THESIS' | translate }}</label>
                  <input type="text" formControlName="thesisTitle" class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                </div>
              </div>
              
              <!-- Upload section -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-2">{{ 'EDUCATION_DETAILS.UPLOAD_CERT' | translate }}</label>
                <button type="button" (click)="openFileManager('postgraduate', i)" 
                        [class]="postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0
                          ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                          : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
                  <svg class="w-5 h-5 mr-2" [class]="postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span class="text-sm font-medium" [class]="postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? 'text-green-700' : 'text-blue-700'">
                    {{ postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? (postgraduateFiles[i].length + ' ' + ('COMMON.FILE_SELECTED' | translate)) : ('COMMON.FILE_UPLOAD' | translate) }}
                  </span>
                </button>
                <p class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</p>
              </div>
            </div>
          }
          <button type="button" (click)="addPostgraduate()" class="mt-4 px-4 py-2 bg-[#a68557] text-white rounded-md hover:bg-[#8b6d47] font-semibold text-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'EDUCATION_DETAILS.ADD_POSTGRAD' | translate }}
          </button>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="currentDialogTitle"
      [fileCategoryId]="currentCategoryId"
      [entityId]="currentEntityId"
      [(files)]="currentFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EducationDetailsEditComponent {
  private readonly translate = inject(TranslateService);
  
  @Input() formGroup!: FormGroup;
  @Input() countries: any[] = [];
  @Input() languages: any[] = [];
  @Input() undergraduateFiles: any[][] = [];
  @Input() postgraduateFiles: any[][] = [];
  @Input() onAddUndergraduate!: () => void;
  @Input() onRemoveUndergraduate!: (index: number) => void;
  @Input() onAddPostgraduate!: () => void;
  @Input() onRemovePostgraduate!: (index: number) => void;
  @Input() onDegreeFileChange!: (event: any, type: string, index: number) => void;
  @Input() onRemoveDegreeFile!: (type: string, degreeIndex: number, fileIndex: number) => void;

  isFileManagerOpen = false;
  currentDialogTitle = '';
  currentFiles: any[] = [];
  currentType = '';
  currentIndex = 0;
  currentCategoryId = 2;
  currentEntityId?: string;

  get undergraduates(): FormArray {
    return this.formGroup.get('undergraduates') as FormArray;
  }

  get postgraduates(): FormArray {
    return this.formGroup.get('postgraduates') as FormArray;
  }

  openFileManager(type: string, index: number): void {
    this.currentType = type;
    this.currentIndex = index;
    
    if (type === 'undergraduate') {
      this.currentDialogTitle = this.translate.instant('FILE_DIALOG.TITLE_UNDERGRAD');
      this.currentFiles = this.undergraduateFiles[index] || [];
      this.currentCategoryId = 2;
      const degree = this.undergraduates.at(index);
      this.currentEntityId = degree?.get('id')?.value || undefined;
    } else {
      this.currentDialogTitle = this.translate.instant('FILE_DIALOG.TITLE_POSTGRAD');
      this.currentFiles = this.postgraduateFiles[index] || [];
      this.currentCategoryId = 3;
      const degree = this.postgraduates.at(index);
      this.currentEntityId = degree?.get('id')?.value || undefined;
    }
    
    this.isFileManagerOpen = true;
  }

  onFilesSaved(files: any[]): void {
    if (this.currentType === 'undergraduate') {
      if (!this.undergraduateFiles[this.currentIndex]) {
        this.undergraduateFiles[this.currentIndex] = [];
      }
      this.undergraduateFiles[this.currentIndex] = files;
    } else {
      if (!this.postgraduateFiles[this.currentIndex]) {
        this.postgraduateFiles[this.currentIndex] = [];
      }
      this.postgraduateFiles[this.currentIndex] = files;
    }
  }

  addUndergraduate(): void { this.onAddUndergraduate(); }
  removeUndergraduate(index: number): void { this.onRemoveUndergraduate(index); }
  addPostgraduate(): void { this.onAddPostgraduate(); }
  removePostgraduate(index: number): void { this.onRemovePostgraduate(index); }
}
