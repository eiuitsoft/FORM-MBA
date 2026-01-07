import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-english-qualifications-view',
  standalone: true,
  imports: [CommonModule, FileManagerDialogComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.ENGLISH' | translate }}</h3>
      </div>

      <div class="p-6 bg-gray-50 space-y-4">
        <!-- IELTS -->
        @if (data?.ielts?.score) {
        <div>
          <h4 class="text-sm font-bold text-[#a68557] mb-2 uppercase tracking-wide">IELTS</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.SCORE_HINT' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.ielts.score }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.DATE_HINT' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.ielts.date | date : 'dd/MM/yyyy' || '--' }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- TOEFL -->
        @if (data?.toefl?.score) {
        <div>
          <h4 class="text-sm font-bold text-[#a68557] mb-2 uppercase tracking-wide">TOEFL</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.SCORE_HINT' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.toefl.score }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.DATE_HINT' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.toefl.date | date : 'dd/MM/yyyy' || '--' }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- Other -->
        @if (data?.other?.name) {
        <div>
          <h4 class="text-sm font-bold text-[#a68557] mb-2 uppercase tracking-wide">{{ data.other.name }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.SCORE_HINT' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.other.score || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'ENGLISH.DATE_HINT' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.other.date | date : 'dd/MM/yyyy' || '--' }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- No qualifications -->
        @if (!hasAnyQualification()) {
        <div class="text-sm text-gray-500 italic">{{ 'ENGLISH.NO_QUALIFICATIONS' | translate }}</div>
        }

        <!-- Upload English Certificates Button -->
        <div class="pt-2">
          <label class="block text-xs font-medium text-gray-600 mb-2">{{ 'ENGLISH.UPLOAD_CERT' | translate }}</label>
          <button
            type="button"
            (click)="openFileManager()"
            [class]="
              englishFiles && englishFiles.length > 0
                ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'
            ">
            <svg
              class="w-5 h-5 mr-2"
              [class]="englishFiles && englishFiles.length > 0 ? 'text-green-600' : 'text-blue-500'"
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
              [class]="englishFiles && englishFiles.length > 0 ? 'text-green-700' : 'text-blue-700'">
              {{
                englishFiles && englishFiles.length > 0
                  ? englishFiles.length + ' ' + ('COMMON.FILE_SELECTED' | translate)
                  : ('ENGLISH.UPLOAD_CERT' | translate)
              }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="dialogTitle"
      [fileCategoryId]="4"
      [(files)]="englishFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EnglishQualificationsViewComponent {
  private readonly translate = inject(TranslateService);

  @Input() data: any;
  @Input() englishFiles: any[] = [];
  @Output() englishFilesChange = new EventEmitter<any[]>();
  @Output() onFilesUpdate = new EventEmitter<any[]>();

  isFileManagerOpen = false;
  dialogTitle = '';

  openFileManager(): void {
    this.dialogTitle = this.translate.instant('FILE_DIALOG.TITLE_ENGLISH');
    this.isFileManagerOpen = true;
  }

  getEnglishEntityId(): string | undefined {
    return this.data?.ielts?.id || this.data?.toefl?.id || this.data?.other?.id || undefined;
  }

  onFilesSaved(files: any[]): void {
    this.englishFiles = files;
    this.englishFilesChange.emit(files);
    this.onFilesUpdate.emit(files);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric', day: 'numeric' });
  }

  hasAnyQualification(): boolean {
    return !!(this.data?.ielts?.score || this.data?.toefl?.score || this.data?.other?.name);
  }
}
