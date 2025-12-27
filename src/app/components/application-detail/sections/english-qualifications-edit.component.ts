import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-english-qualifications-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileManagerDialogComponent],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION D - ENGLISH QUALIFICATIONS</h3>
      </div>
      <div class="p-6 bg-gray-50 space-y-6">
        <p class="text-sm text-gray-600">At least one English qualification is required</p>
        
        <!-- IELTS -->
        <div class="pl-4" formGroupName="ielts">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">IELTS</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score (0-9)</label>
              <input type="text" formControlName="score" placeholder="e.g., 7.5"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('ielts.score')?.hasError('invalidIeltsScore') && formGroup.get('ielts.score')?.touched) {
                <p class="text-red-600 text-xs mt-1">IELTS score must be between 0 and 9</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" formControlName="date"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('ielts.date')?.hasError('conditionalRequired') && formGroup.get('ielts.date')?.touched) {
                <p class="text-red-600 text-xs mt-1">Date is required when score is provided</p>
              }
            </div>
          </div>
        </div>

        <!-- TOEFL -->
        <div class="pl-4" formGroupName="toefl">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">TOEFL</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score (0-120)</label>
              <input type="text" formControlName="score" placeholder="e.g., 95"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('toefl.score')?.hasError('invalidToeflScore') && formGroup.get('toefl.score')?.touched) {
                <p class="text-red-600 text-xs mt-1">TOEFL score must be between 0 and 120</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" formControlName="date"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('toefl.date')?.hasError('conditionalRequired') && formGroup.get('toefl.date')?.touched) {
                <p class="text-red-600 text-xs mt-1">Date is required when score is provided</p>
              }
            </div>
          </div>
        </div>

        <!-- Other -->
        <div class="pl-4" formGroupName="other">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">Other English Test</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Test Name</label>
              <input type="text" formControlName="name" placeholder="e.g., Cambridge"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score</label>
              <input type="text" formControlName="score" placeholder="e.g., B2"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" formControlName="date"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
          </div>
        </div>

        <!-- Upload English Certificates (Common) -->
        <div class="border-t pt-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">Upload English Certificates</label>
          <button type="button" (click)="openFileManager()" 
                  [class]="englishFiles && englishFiles.length > 0
                    ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                    : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
            <svg class="w-5 h-5 mr-2" [class]="englishFiles && englishFiles.length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm font-medium" [class]="englishFiles && englishFiles.length > 0 ? 'text-green-700' : 'text-blue-700'">
              {{ englishFiles && englishFiles.length > 0 ? englishFiles.length + ' file(s) uploaded - Click to manage' : 'Click to upload files' }}
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1">Upload all English certificates (IELTS, TOEFL, or other) - PDF, JPG, or PNG, max 5MB per file</p>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="'Manage English Certificate Files'"
      [fileCategoryId]="4"
      [entityId]="getEnglishEntityId()"
      [(files)]="englishFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EnglishQualificationsEditComponent {
  @Input() formGroup!: FormGroup;
  @Input() englishFiles: any[] = [];
  @Input() onEnglishFileChange!: (event: any) => void;
  @Input() onRemoveEnglishFile!: (index: number) => void;

  isFileManagerOpen = false;

  openFileManager(): void {
    this.isFileManagerOpen = true;
  }

  /**
   * Get entity ID for English qualifications
   * Returns the first non-null ID from IELTS, TOEFL, or Other
   */
  getEnglishEntityId(): string | undefined {
    const ieltsId = this.formGroup?.get('ielts.id')?.value;
    const toeflId = this.formGroup?.get('toefl.id')?.value;
    const otherId = this.formGroup?.get('other.id')?.value;
    return ieltsId || toeflId || otherId || undefined;
  }

  onFilesSaved(files: any[]): void {
    this.englishFiles = files;
  }

  removeEnglishFile(index: number): void {
    if (this.onRemoveEnglishFile) {
      this.onRemoveEnglishFile(index);
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
