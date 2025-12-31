import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-education-details-view',
  standalone: true,
  imports: [CommonModule, FileManagerDialogComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.EDUCATION' | translate }}</h3>
      </div>

      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Undergraduate Degrees -->
        <div>
          <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">{{ 'EDUCATION_DETAILS.UNDERGRAD_TITLE' | translate }}</h4>
          @if (data?.undergraduates && data.undergraduates.length > 0) {
            @for (degree of data.undergraduates; track $index; let i = $index) {
              <div class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
                <p class="text-sm font-bold text-[#a68557] mb-3 uppercase">
                  @if (i === 0) { {{ 'EDUCATION_DETAILS.UNDERGRAD_TITLE' | translate }} }
                  @else if (i === 1) { {{ 'EDUCATION_DETAILS.SECOND_DEGREE' | translate }} }
                  @else { {{ i + 1 }}{{ 'EDUCATION_DETAILS.OTHER_DEGREE' | translate }} }
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.UNIVERSITY' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.university || '--'">
                      {{ degree.university || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.COUNTRY' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.countryName || '--'">
                      {{ degree.countryName || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.MAJOR' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.major || '--'">
                      {{ degree.major || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.graduationYear || '--'">
                      {{ degree.graduationYear || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.LANGUAGE' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.languageName || '--'">
                      {{ degree.languageName || '--' }}
                    </div>
                  </div>
                </div>

                <!-- Upload Button -->
                <button type="button" (click)="openFileManager('undergraduate', i)" 
                        [class]="undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0
                          ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                          : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
                  <svg class="w-5 h-5 mr-2" [class]="undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span class="text-sm font-medium" [class]="undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? 'text-green-700' : 'text-blue-700'">
                    {{ undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? (undergraduateFiles[i].length + ' ' + ('COMMON.FILE_SELECTED' | translate)) : ('EDUCATION_DETAILS.UPLOAD_CERT' | translate) }}
                  </span>
                </button>
              </div>
            }
          } @else {
            <p class="text-sm text-gray-500 italic">{{ 'EDUCATION_DETAILS.NO_UNDERGRAD' | translate }}</p>
          }
        </div>

        <!-- Postgraduate Degrees -->
        <div>
          <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">{{ 'EDUCATION_DETAILS.POSTGRAD_TITLE' | translate }}</h4>
          @if (data?.postgraduates && data.postgraduates.length > 0) {
            @for (degree of data.postgraduates; track $index; let i = $index) {
              <div class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
                <p class="text-sm font-bold text-[#a68557] mb-3 uppercase">
                  @if (i === 0) { {{ 'EDUCATION_DETAILS.POSTGRAD_TITLE' | translate }} }
                  @else { {{ i + 1 }}{{ 'EDUCATION_DETAILS.OTHER_POSTGRAD' | translate }} }
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.UNIVERSITY' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.university || '--'">
                      {{ degree.university || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.COUNTRY' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.countryName || '--'">
                      {{ degree.countryName || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.MAJOR' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.major || '--'">
                      {{ degree.major || '--' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.GRAD_YEAR' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.graduationYear || '--'">
                      {{ degree.graduationYear || '--' }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.LANGUAGE' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.languageName || '--'">
                      {{ degree.languageName || '--' }}
                    </div>
                  </div>
                  <div class="md:col-span-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EDUCATION_DETAILS.THESIS' | translate }}</label>
                    <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" [title]="degree.thesisTitle || '--'">
                      {{ degree.thesisTitle || '--' }}
                    </div>
                  </div>
                </div>

                <!-- Upload Button -->
                <button type="button" (click)="openFileManager('postgraduate', i)" 
                        [class]="postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0
                          ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                          : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
                  <svg class="w-5 h-5 mr-2" [class]="postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span class="text-sm font-medium" [class]="postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? 'text-green-700' : 'text-blue-700'">
                    {{ postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? (postgraduateFiles[i].length + ' ' + ('COMMON.FILE_SELECTED' | translate)) : ('EDUCATION_DETAILS.UPLOAD_CERT' | translate) }}
                  </span>
                </button>
              </div>
            }
          } @else {
            <p class="text-sm text-gray-500 italic">{{ 'EDUCATION_DETAILS.NO_POSTGRAD' | translate }}</p>
          }
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
export class EducationDetailsViewComponent {
  private readonly translate = inject(TranslateService);
  
  @Input() data: any;
  @Input() undergraduateFiles: any[][] = [];
  @Input() postgraduateFiles: any[][] = [];
  @Output() undergraduateFilesChange = new EventEmitter<any[][]>();
  @Output() postgraduateFilesChange = new EventEmitter<any[][]>();
  @Output() onFilesUpdate = new EventEmitter<{type: string, index: number, files: any[]}>();

  isFileManagerOpen = false;
  currentDialogTitle = '';
  currentFiles: any[] = [];
  currentType = '';
  currentIndex = 0;
  currentCategoryId = 2;
  currentEntityId?: string;

  openFileManager(type: string, index: number): void {
    this.currentType = type;
    this.currentIndex = index;
    
    if (type === 'undergraduate') {
      this.currentDialogTitle = this.translate.instant('FILE_DIALOG.TITLE_UNDERGRAD');
      this.currentFiles = this.undergraduateFiles[index] || [];
      this.currentCategoryId = 2;
      const degree = this.data?.undergraduates?.[index];
      this.currentEntityId = degree?.id || undefined;
    } else {
      this.currentDialogTitle = this.translate.instant('FILE_DIALOG.TITLE_POSTGRAD');
      this.currentFiles = this.postgraduateFiles[index] || [];
      this.currentCategoryId = 3;
      const degree = this.data?.postgraduates?.[index];
      this.currentEntityId = degree?.id || undefined;
    }
    
    this.isFileManagerOpen = true;
  }

  onFilesSaved(files: any[]): void {
    if (this.currentType === 'undergraduate') {
      const updated = [...this.undergraduateFiles];
      updated[this.currentIndex] = files;
      this.undergraduateFiles = updated;
      this.undergraduateFilesChange.emit(updated);
    } else {
      const updated = [...this.postgraduateFiles];
      updated[this.currentIndex] = files;
      this.postgraduateFiles = updated;
      this.postgraduateFilesChange.emit(updated);
    }
    
    this.onFilesUpdate.emit({
      type: this.currentType,
      index: this.currentIndex,
      files: files
    });
  }
}
