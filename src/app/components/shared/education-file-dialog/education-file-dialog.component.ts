import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@/src/app/core/services/alert/alert.service';

type EducationDocumentType = 'degree' | 'transcript' | 'recognition';

@Component({
  selector: 'app-education-file-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
    <div class="fixed inset-0 z-50 overflow-y-auto" (click)="onBackdropClick()">
      <div class="flex items-center justify-center min-h-screen px-4 py-6">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>

        <div
          class="relative inline-block w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
          (click)="$event.stopPropagation()">
          <div class="px-6 py-4 border-b border-gray-200 bg-white">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-600">{{ 'FILE_DIALOG.EDUCATION_NOTE' | translate }}</p>
          </div>

          <div class="px-6 py-4 bg-gray-50 space-y-4">
            <div class="p-4 bg-white border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-[#153a5e]">{{ 'FILE_DIALOG.DOC_TYPE_DEGREE' | translate }}</h4>
                <span class="text-xs text-gray-500">{{ draftDegreeFiles.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
              </div>
              <label
                class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                <div class="text-sm text-blue-700 font-medium">{{ 'FILE_DIALOG.CLICK_TO_UPLOAD' | translate }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</div>
                <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple (change)="onFileSelect($event, 'degree')" />
              </label>
              @if (draftDegreeFiles.length > 0) {
              <div class="mt-3 space-y-2">
                @for (file of draftDegreeFiles; track $index) {
                <div class="flex items-center justify-between p-2 text-sm bg-blue-50 border border-blue-200 rounded">
                  <div class="truncate">
                    <div class="font-medium text-gray-900 truncate">{{ file.name }}</div>
                    <div class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button type="button" class="ml-2 text-red-600 hover:text-red-800" (click)="removeDraftFile('degree', $index)">
                    {{ 'COMMON.REMOVE' | translate }}
                  </button>
                </div>
                }
              </div>
              }
            </div>

            <div class="p-4 bg-white border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-[#153a5e]">{{ 'FILE_DIALOG.DOC_TYPE_TRANSCRIPT' | translate }}</h4>
                <span class="text-xs text-gray-500">{{ draftTranscriptFiles.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
              </div>
              <label
                class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                <div class="text-sm text-blue-700 font-medium">{{ 'FILE_DIALOG.CLICK_TO_UPLOAD' | translate }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</div>
                <input
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  (change)="onFileSelect($event, 'transcript')" />
              </label>
              @if (draftTranscriptFiles.length > 0) {
              <div class="mt-3 space-y-2">
                @for (file of draftTranscriptFiles; track $index) {
                <div class="flex items-center justify-between p-2 text-sm bg-blue-50 border border-blue-200 rounded">
                  <div class="truncate">
                    <div class="font-medium text-gray-900 truncate">{{ file.name }}</div>
                    <div class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button type="button" class="ml-2 text-red-600 hover:text-red-800" (click)="removeDraftFile('transcript', $index)">
                    {{ 'COMMON.REMOVE' | translate }}
                  </button>
                </div>
                }
              </div>
              }
            </div>

            @if (showRecognition) {
            <div class="p-4 bg-white border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-[#153a5e]">{{ 'FILE_DIALOG.DOC_TYPE_RECOGNITION' | translate }}</h4>
                <span class="text-xs text-gray-500">{{ draftRecognitionFiles.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
              </div>
              <label
                class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                <div class="text-sm text-blue-700 font-medium">{{ 'FILE_DIALOG.CLICK_TO_UPLOAD' | translate }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</div>
                <input
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  (change)="onFileSelect($event, 'recognition')" />
              </label>
              @if (draftRecognitionFiles.length > 0) {
              <div class="mt-3 space-y-2">
                @for (file of draftRecognitionFiles; track $index) {
                <div class="flex items-center justify-between p-2 text-sm bg-blue-50 border border-blue-200 rounded">
                  <div class="truncate">
                    <div class="font-medium text-gray-900 truncate">{{ file.name }}</div>
                    <div class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <button type="button" class="ml-2 text-red-600 hover:text-red-800" (click)="removeDraftFile('recognition', $index)">
                    {{ 'COMMON.REMOVE' | translate }}
                  </button>
                </div>
                }
              </div>
              }
            </div>
            }
          </div>

          <div class="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              {{ 'COMMON.CANCEL' | translate }}
            </button>
            <button
              type="button"
              (click)="saveFiles()"
              class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#153a5e] hover:bg-[#0f2942]">
              {{ 'FILE_DIALOG.SAVE' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
    }
  `
})
export class EducationFileDialogComponent implements OnChanges {
  private readonly alertService = inject(AlertService);
  private readonly translate = inject(TranslateService);

  @Input() isOpen = false;
  @Input() title = '';
  @Input() showRecognition = true;
  @Input() degreeFiles: File[] = [];
  @Input() transcriptFiles: File[] = [];
  @Input() recognitionFiles: File[] = [];

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<{
    degreeFiles: File[];
    transcriptFiles: File[];
    recognitionFiles: File[];
  }>();

  draftDegreeFiles: File[] = [];
  draftTranscriptFiles: File[] = [];
  draftRecognitionFiles: File[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.draftDegreeFiles = [...(this.degreeFiles || [])];
      this.draftTranscriptFiles = [...(this.transcriptFiles || [])];
      this.draftRecognitionFiles = [...(this.recognitionFiles || [])];
    }
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  saveFiles(): void {
    this.onSave.emit({
      degreeFiles: [...this.draftDegreeFiles],
      transcriptFiles: [...this.draftTranscriptFiles],
      recognitionFiles: [...this.draftRecognitionFiles]
    });
    this.close();
  }

  onFileSelect(event: Event, docType: EducationDocumentType): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = input.files ? Array.from(input.files) : [];

    if (selectedFiles.length === 0) {
      return;
    }

    for (const file of selectedFiles) {
      if (!this.isValidFile(file)) {
        continue;
      }
      this.pushFile(docType, file);
    }

    input.value = '';
  }

  removeDraftFile(docType: EducationDocumentType, index: number): void {
    const list = this.getDraftList(docType);
    list.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private isValidFile(file: File): boolean {
    if (file.size > 5 * 1024 * 1024) {
      this.alertService.error(
        this.translate.instant('FILE_DIALOG.ERROR'),
        `${file.name} ${this.translate.instant('FILE_DIALOG.FILE_SIZE_LIMIT')}`
      );
      return false;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.alertService.error(
        this.translate.instant('FILE_DIALOG.ERROR'),
        `${file.name} ${this.translate.instant('FILE_DIALOG.FILE_INVALID_TYPE')}`
      );
      return false;
    }

    return true;
  }

  private pushFile(docType: EducationDocumentType, file: File): void {
    const list = this.getDraftList(docType);
    list.push(file);
  }

  private getDraftList(docType: EducationDocumentType): File[] {
    switch (docType) {
      case 'degree':
        return this.draftDegreeFiles;
      case 'transcript':
        return this.draftTranscriptFiles;
      case 'recognition':
        return this.draftRecognitionFiles;
      default:
        return this.draftDegreeFiles;
    }
  }
}
