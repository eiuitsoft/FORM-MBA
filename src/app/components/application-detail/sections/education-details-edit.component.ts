import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-education-details-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileManagerDialogComponent],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION C - PREVIOUS EDUCATION DETAILS</h3>
      </div>
      
      <div class="p-6 bg-gray-50 space-y-6">
      <!-- Undergraduate Degrees -->
      <div class="mb-8" formArrayName="undergraduates">
        <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">Undergraduate Qualifications</h4>
        <div *ngFor="let degree of undergraduates.controls; let i = index" 
             [formGroupName]="i"
             class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
          <div class="flex justify-between items-center mb-3">
            <p class="text-sm font-bold text-[#a68557] uppercase">{{ i === 0 ? 'First degree' : (i === 1 ? 'Second degree' : 'Degree ' + (i + 1)) }}</p>
            <button *ngIf="i > 1" type="button" (click)="removeUndergraduate(i)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium">✕ Remove</button>
          </div>
          
          <!-- Single row with 5 fields -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">University <span *ngIf="i === 0" class="text-red-600">*</span></label>
              <input type="text" formControlName="university" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (i === 0 && degree.get('university')?.hasError('required') && degree.get('university')?.touched) {
                <p class="text-red-600 text-xs mt-1">University is required</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Country <span *ngIf="i === 0" class="text-red-600">*</span></label>
              <select formControlName="countryId" 
                      class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                <option value="">-- Select --</option>
                <option *ngFor="let country of countries" [value]="country.id">{{ country.name }}</option>
              </select>
              @if (i === 0 && degree.get('countryId')?.hasError('required') && degree.get('countryId')?.touched) {
                <p class="text-red-600 text-xs mt-1">Country is required</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Major <span *ngIf="i === 0" class="text-red-600">*</span></label>
              <input type="text" formControlName="major" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (i === 0 && degree.get('major')?.hasError('required') && degree.get('major')?.touched) {
                <p class="text-red-600 text-xs mt-1">Major is required</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Graduation Year <span *ngIf="i === 0" class="text-red-600">*</span></label>
              <input type="number" formControlName="graduationYear" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (i === 0 && degree.get('graduationYear')?.hasError('required') && degree.get('graduationYear')?.touched) {
                <p class="text-red-600 text-xs mt-1">Graduation year is required</p>
              }
              @if (i === 0 && degree.get('graduationYear')?.hasError('invalidYear') && degree.get('graduationYear')?.touched) {
                <p class="text-red-600 text-xs mt-1">Invalid graduation year</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Language <span *ngIf="i === 0" class="text-red-600">*</span></label>
              <select formControlName="languageId" 
                      class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                <option value="">-- Select --</option>
                <option *ngFor="let lang of languages" [value]="lang.id">{{ lang.name }}</option>
              </select>
              @if (i === 0 && degree.get('languageId')?.hasError('required') && degree.get('languageId')?.touched) {
                <p class="text-red-600 text-xs mt-1">Language is required</p>
              }
            </div>
          </div>
          
          <!-- Upload section -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-2">Upload Degree Certificate</label>
            <button type="button" (click)="openFileManager('undergraduate', i)" 
                    class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-sm text-gray-600">
                {{ undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? undergraduateFiles[i].length + ' file(s) uploaded - Click to manage' : 'Click to upload files' }}
              </span>
            </button>
            <p class="text-xs text-gray-500 mt-1">Upload degree certificate (PDF, JPG, or PNG, max 5MB per file)</p>
          </div>
        </div>
        <button type="button" (click)="addUndergraduate()"
                class="mt-4 px-4 py-2 bg-[#a68557] text-white rounded-md hover:bg-[#8b6d47] font-semibold text-sm transition-colors flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Another Degree
        </button>
      </div>

      <!-- Postgraduate Degrees -->
      <div formArrayName="postgraduates">
        <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">Postgraduate Qualifications</h4>
        <div *ngFor="let degree of postgraduates.controls; let i = index" 
             [formGroupName]="i"
             class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
          <div class="flex justify-between items-center mb-3">
            <p class="text-sm font-bold text-[#a68557] uppercase">Degree {{ i + 1 }}</p>
            <button *ngIf="i > 0" type="button" (click)="removePostgraduate(i)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium">✕ Remove</button>
          </div>
          
          <!-- Row 1: 4 fields -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">University</label>
              <input type="text" formControlName="university" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <select formControlName="countryId" 
                      class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                <option value="">-- Select --</option>
                <option *ngFor="let country of countries" [value]="country.id">{{ country.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Major</label>
              <input type="text" formControlName="major" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Graduation Year</label>
              <input type="number" formControlName="graduationYear" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
          </div>
          
          <!-- Row 2: Language + Thesis Title -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Language</label>
              <select formControlName="languageId" 
                      class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
                <option value="">-- Select --</option>
                <option *ngFor="let lang of languages" [value]="lang.id">{{ lang.name }}</option>
              </select>
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-medium text-gray-600 mb-1">Thesis Title</label>
              <input type="text" formControlName="thesisTitle" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
          </div>
          
          <!-- Upload section -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-2">Upload Degree Certificate</label>
            <button type="button" (click)="openFileManager('postgraduate', i)" 
                    class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-sm text-gray-600">
                {{ postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? postgraduateFiles[i].length + ' file(s) uploaded - Click to manage' : 'Click to upload files' }}
              </span>
            </button>
            <p class="text-xs text-gray-500 mt-1">Upload degree certificate (PDF, JPG, or PNG, max 5MB per file)</p>
          </div>
        </div>
        <button type="button" (click)="addPostgraduate()"
                class="mt-4 px-4 py-2 bg-[#a68557] text-white rounded-md hover:bg-[#8b6d47] font-semibold text-sm transition-colors flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Another Degree
        </button>
      </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="currentDialogTitle"
      [(files)]="currentFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EducationDetailsEditComponent {
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
      this.currentDialogTitle = `Quản lý tệp Undergraduate Degree ${index + 1}`;
      this.currentFiles = this.undergraduateFiles[index] || [];
    } else {
      this.currentDialogTitle = `Quản lý tệp Postgraduate Degree ${index + 1}`;
      this.currentFiles = this.postgraduateFiles[index] || [];
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

  addUndergraduate(): void {
    this.onAddUndergraduate();
  }

  removeUndergraduate(index: number): void {
    this.onRemoveUndergraduate(index);
  }

  addPostgraduate(): void {
    this.onAddPostgraduate();
  }

  removePostgraduate(index: number): void {
    this.onRemovePostgraduate(index);
  }

  removeDegreeFile(type: string, degreeIndex: number, fileIndex: number): void {
    if (this.onRemoveDegreeFile) {
      this.onRemoveDegreeFile(type, degreeIndex, fileIndex);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
