import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-english-qualifications-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileManagerDialogComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.ENGLISH' | translate }}</h3>
      </div>
      <div class="p-6 bg-gray-50 space-y-6">
        <p class="text-sm text-gray-600">{{ 'ENGLISH.AT_LEAST_ONE' | translate }}</p>
        
        <!-- IELTS -->
        <div class="pl-4" formGroupName="ielts">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">IELTS</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.SCORE_HINT' | translate }} (0-9)</label>
              <input type="text" formControlName="score" placeholder="e.g., 7.5"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('ielts.score')?.hasError('invalidIeltsScore') && formGroup.get('ielts.score')?.touched) {
                <p class="text-red-600 text-xs mt-1">{{ 'ENGLISH.IELTS_RANGE' | translate }}</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.DATE_HINT' | translate }}</label>
              <input type="date" formControlName="date"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('ielts.date')?.hasError('conditionalRequired') && formGroup.get('ielts.date')?.touched) {
                <p class="text-red-600 text-xs mt-1">{{ 'ENGLISH.DATE_REQUIRED' | translate }}</p>
              }
            </div>
          </div>
        </div>

        <!-- TOEFL -->
        <div class="pl-4" formGroupName="toefl">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">TOEFL</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.SCORE_HINT' | translate }} (0-120)</label>
              <input type="text" formControlName="score" placeholder="e.g., 95"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('toefl.score')?.hasError('invalidToeflScore') && formGroup.get('toefl.score')?.touched) {
                <p class="text-red-600 text-xs mt-1">{{ 'ENGLISH.TOEFL_RANGE' | translate }}</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.DATE_HINT' | translate }}</label>
              <input type="date" formControlName="date"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
              @if (formGroup.get('toefl.date')?.hasError('conditionalRequired') && formGroup.get('toefl.date')?.touched) {
                <p class="text-red-600 text-xs mt-1">{{ 'ENGLISH.DATE_REQUIRED' | translate }}</p>
              }
            </div>
          </div>
        </div>

        <!-- Other -->
        <div class="pl-4" formGroupName="other">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">{{ 'ENGLISH.OTHER_TEST' | translate }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.TEST_NAME' | translate }}</label>
              <input type="text" formControlName="name" placeholder="e.g., Cambridge"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.SCORE_HINT' | translate }}</label>
              <input type="text" formControlName="score" placeholder="e.g., B2"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.DATE_HINT' | translate }}</label>
              <input type="date" formControlName="date"
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
          </div>
        </div>

        <!-- Upload English Certificates -->
        <div class="border-t pt-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">{{ 'ENGLISH.UPLOAD_CERT' | translate }}</label>
          <button type="button" (click)="openFileManager()" 
                  [class]="englishFiles && englishFiles.length > 0
                    ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                    : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
            <svg class="w-5 h-5 mr-2" [class]="englishFiles && englishFiles.length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm font-medium" [class]="englishFiles && englishFiles.length > 0 ? 'text-green-700' : 'text-blue-700'">
              {{ englishFiles && englishFiles.length > 0 ? (englishFiles.length + ' ' + ('COMMON.FILE_SELECTED' | translate)) : ('COMMON.FILE_UPLOAD' | translate) }}
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</p>
        </div>
      </div>
    </section>

    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="dialogTitle"
      [fileCategoryId]="4"
      [entityId]="getEnglishEntityId()"
      [(files)]="englishFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EnglishQualificationsEditComponent {
  private readonly translate = inject(TranslateService);
  
  @Input() formGroup!: FormGroup;
  @Input() englishFiles: any[] = [];
  @Input() onEnglishFileChange!: (event: any) => void;
  @Input() onRemoveEnglishFile!: (index: number) => void;

  isFileManagerOpen = false;
  dialogTitle = '';

  openFileManager(): void {
    this.dialogTitle = this.translate.instant('FILE_DIALOG.TITLE_ENGLISH');
    this.isFileManagerOpen = true;
  }

  getEnglishEntityId(): string | undefined {
    return this.formGroup?.get('ielts.id')?.value || this.formGroup?.get('toefl.id')?.value || this.formGroup?.get('other.id')?.value || undefined;
  }

  onFilesSaved(files: any[]): void { this.englishFiles = files; }
}
