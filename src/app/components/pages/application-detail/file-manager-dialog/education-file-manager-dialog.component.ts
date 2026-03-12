import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertService } from '@/src/app/core/services/alert/alert.service';
import { TokenService } from '@/src/app/core/services/auth/token.service';
import { MbaService } from '@/src/app/core/services/mba/mba.service';

type EducationGroup = 'degree' | 'transcript' | 'recognition';

type DegreeLevel = 'undergraduate' | 'postgraduate';

interface ManagedFile {
  id?: string | number;
  fileName: string;
  fileLocalName?: string;
  fileSize: number;
  fileType: string;
  fileFullPath: string;
  sortOrder?: number;
  categoryCode: string;
}

@Component({
  selector: 'app-education-file-manager-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
    <div class="fixed inset-0 z-50 overflow-y-auto" (click)="onBackdropClick()">
      <div class="flex items-center justify-center min-h-screen px-4 py-6">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>

        <div
          class="relative inline-block w-full max-w-5xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
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

          <div class="px-6 py-4 bg-gray-50">
            @if (loading) {
            <div class="flex items-center justify-center py-10">
              <svg class="animate-spin h-8 w-8 text-[#a68557]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="ml-3 text-gray-600">{{ 'FILE_DIALOG.LOADING' | translate }}</span>
            </div>
            } @else {
            @if (uploadBlocked) {
            <div class="mb-4 p-3 border border-red-200 rounded bg-red-50 text-sm text-red-700">
              {{ blockMessage }}
            </div>
            }

            <div class="space-y-4">
              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-[#153a5e]">{{ 'FILE_DIALOG.DOC_TYPE_DEGREE' | translate }}</h4>
                  <span class="text-xs text-gray-500">{{ filesByGroup.degree.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
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
                    [disabled]="uploadBlocked"
                    (change)="onFileSelect($event, 'degree')" />
                </label>

                @if (pendingFilesByGroup.degree.length > 0) {
                <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="text-sm font-semibold text-gray-700 mb-2">{{ 'FILE_DIALOG.SELECTED_NOT_SAVED' | translate }}</div>
                  <div class="space-y-2">
                    @for (file of pendingFilesByGroup.degree; track $index) {
                    <div class="flex items-center justify-between p-2 text-sm bg-white border border-yellow-300 rounded">
                      <div class="truncate">
                        <div class="font-medium text-gray-900 truncate">{{ file.name }}</div>
                        <div class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</div>
                      </div>
                      <button type="button" class="ml-2 text-red-600 hover:text-red-800" (click)="removePendingFile('degree', $index)">
                        {{ 'COMMON.REMOVE' | translate }}
                      </button>
                    </div>
                    }
                  </div>
                </div>
                }

                @if (filesByGroup.degree.length > 0) {
                <div class="mt-3 space-y-2">
                  @for (file of filesByGroup.degree; track file.id || $index) {
                  <div class="flex items-center justify-between p-2 text-sm bg-gray-50 border border-gray-200 rounded">
                    <div class="truncate">
                      <div class="font-medium text-gray-900 truncate">{{ file.fileName }}</div>
                      <div class="text-xs text-gray-600">{{ getFileTypeLabel(file.fileType) }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="px-2 py-1 text-xs text-white bg-[#a68557] rounded hover:bg-[#8b6d47]"
                        (click)="downloadFile(file)">
                        {{ 'FILE_DIALOG.DOWNLOAD' | translate }}
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                        (click)="deleteUploadedFile('degree', $index)">
                        {{ 'FILE_DIALOG.DELETE' | translate }}
                      </button>
                    </div>
                  </div>
                  }
                </div>
                }
              </div>

              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-[#153a5e]">{{ 'FILE_DIALOG.DOC_TYPE_TRANSCRIPT' | translate }}</h4>
                  <span class="text-xs text-gray-500">{{ filesByGroup.transcript.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
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
                    [disabled]="uploadBlocked"
                    (change)="onFileSelect($event, 'transcript')" />
                </label>

                @if (pendingFilesByGroup.transcript.length > 0) {
                <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="text-sm font-semibold text-gray-700 mb-2">{{ 'FILE_DIALOG.SELECTED_NOT_SAVED' | translate }}</div>
                  <div class="space-y-2">
                    @for (file of pendingFilesByGroup.transcript; track $index) {
                    <div class="flex items-center justify-between p-2 text-sm bg-white border border-yellow-300 rounded">
                      <div class="truncate">
                        <div class="font-medium text-gray-900 truncate">{{ file.name }}</div>
                        <div class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</div>
                      </div>
                      <button type="button" class="ml-2 text-red-600 hover:text-red-800" (click)="removePendingFile('transcript', $index)">
                        {{ 'COMMON.REMOVE' | translate }}
                      </button>
                    </div>
                    }
                  </div>
                </div>
                }

                @if (filesByGroup.transcript.length > 0) {
                <div class="mt-3 space-y-2">
                  @for (file of filesByGroup.transcript; track file.id || $index) {
                  <div class="flex items-center justify-between p-2 text-sm bg-gray-50 border border-gray-200 rounded">
                    <div class="truncate">
                      <div class="font-medium text-gray-900 truncate">{{ file.fileName }}</div>
                      <div class="text-xs text-gray-600">{{ getFileTypeLabel(file.fileType) }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="px-2 py-1 text-xs text-white bg-[#a68557] rounded hover:bg-[#8b6d47]"
                        (click)="downloadFile(file)">
                        {{ 'FILE_DIALOG.DOWNLOAD' | translate }}
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                        (click)="deleteUploadedFile('transcript', $index)">
                        {{ 'FILE_DIALOG.DELETE' | translate }}
                      </button>
                    </div>
                  </div>
                  }
                </div>
                }
              </div>

              @if (showRecognitionForDialog) {
              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-[#153a5e]">{{ 'FILE_DIALOG.DOC_TYPE_RECOGNITION' | translate }}</h4>
                  <span class="text-xs text-gray-500">{{ filesByGroup.recognition.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
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
                    [disabled]="uploadBlocked"
                    (change)="onFileSelect($event, 'recognition')" />
                </label>

                @if (pendingFilesByGroup.recognition.length > 0) {
                <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="text-sm font-semibold text-gray-700 mb-2">{{ 'FILE_DIALOG.SELECTED_NOT_SAVED' | translate }}</div>
                  <div class="space-y-2">
                    @for (file of pendingFilesByGroup.recognition; track $index) {
                    <div class="flex items-center justify-between p-2 text-sm bg-white border border-yellow-300 rounded">
                      <div class="truncate">
                        <div class="font-medium text-gray-900 truncate">{{ file.name }}</div>
                        <div class="text-xs text-gray-600">{{ formatFileSize(file.size) }}</div>
                      </div>
                      <button type="button" class="ml-2 text-red-600 hover:text-red-800" (click)="removePendingFile('recognition', $index)">
                        {{ 'COMMON.REMOVE' | translate }}
                      </button>
                    </div>
                    }
                  </div>
                </div>
                }

                @if (filesByGroup.recognition.length > 0) {
                <div class="mt-3 space-y-2">
                  @for (file of filesByGroup.recognition; track file.id || $index) {
                  <div class="flex items-center justify-between p-2 text-sm bg-gray-50 border border-gray-200 rounded">
                    <div class="truncate">
                      <div class="font-medium text-gray-900 truncate">{{ file.fileName }}</div>
                      <div class="text-xs text-gray-600">{{ getFileTypeLabel(file.fileType) }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="px-2 py-1 text-xs text-white bg-[#a68557] rounded hover:bg-[#8b6d47]"
                        (click)="downloadFile(file)">
                        {{ 'FILE_DIALOG.DOWNLOAD' | translate }}
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                        (click)="deleteUploadedFile('recognition', $index)">
                        {{ 'FILE_DIALOG.DELETE' | translate }}
                      </button>
                    </div>
                  </div>
                  }
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
              [disabled]="uploadBlocked || uploading"
              class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#153a5e] hover:bg-[#0f2942] disabled:bg-gray-400">
              {{ uploading ? ('FILE_DIALOG.UPLOADING' | translate) : ('FILE_DIALOG.SAVE' | translate) }}
            </button>
          </div>
        </div>
      </div>
    </div>
    }
  `
})
export class EducationFileManagerDialogComponent implements OnChanges {
  private readonly alertService = inject(AlertService);
  private readonly mbaService = inject(MbaService);
  private readonly tokenService = inject(TokenService);
  private readonly translate = inject(TranslateService);

  @Input() isOpen = false;
  @Input() title = '';
  @Input() files: ManagedFile[] = [];
  @Input() degreeLevel: DegreeLevel = 'undergraduate';
  @Input() entityId?: string;
  @Input() showRecognition = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() filesChange = new EventEmitter<ManagedFile[]>();
  @Output() onSave = new EventEmitter<ManagedFile[]>();

  loading = false;
  uploading = false;
  uploadBlocked = false;
  blockMessage = 'Unable to load file categories, please try again.';

  filesByGroup: Record<EducationGroup, ManagedFile[]> = { degree: [], transcript: [], recognition: [] };
  pendingFilesByGroup: Record<EducationGroup, File[]> = { degree: [], transcript: [], recognition: [] };

  private categoryIdByGroup: Partial<Record<EducationGroup, number>> = {};

  get studentId(): string {
    return this.tokenService.studentId();
  }

  get showRecognitionForDialog(): boolean {
    return this.degreeLevel === 'undergraduate' && this.showRecognition;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.resolveCategoriesAndLoadFiles();
    }
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onFileSelect(event: Event, group: EducationGroup): void {
    if (this.uploadBlocked) return;

    const input = event.target as HTMLInputElement;
    const selectedFiles = input.files ? Array.from(input.files) : [];

    for (const file of selectedFiles) {
      if (!this.isValidFile(file)) continue;
      this.pendingFilesByGroup[group].push(file);
    }

    input.value = '';
  }

  removePendingFile(group: EducationGroup, index: number): void {
    this.pendingFilesByGroup[group].splice(index, 1);
  }

  async saveFiles(): Promise<void> {
    if (this.uploadBlocked) return;

    const activeGroups = this.getActiveGroups();
    const hasPending = activeGroups.some((group) => this.pendingFilesByGroup[group].length > 0);

    if (!hasPending) {
      const allFiles = this.flattenFiles();
      this.filesChange.emit(allFiles);
      this.onSave.emit(allFiles);
      this.alertService.successMin(this.translate.instant('FILE_DIALOG.SAVED_SUCCESS'));
      return;
    }

    this.uploading = true;
    try {
      for (const group of activeGroups) {
        if (this.pendingFilesByGroup[group].length === 0) continue;
        const uploaded = await this.uploadByGroup(group);
        this.filesByGroup[group] = [...this.filesByGroup[group], ...uploaded];
        this.pendingFilesByGroup[group] = [];
      }

      const allFiles = this.flattenFiles();
      this.filesChange.emit(allFiles);
      this.onSave.emit(allFiles);
      this.alertService.successMin(this.translate.instant('FILE_DIALOG.UPLOAD_SUCCESS'));
    } catch {
      this.alertService.error(
        this.translate.instant('FILE_DIALOG.ERROR'),
        this.translate.instant('FILE_DIALOG.UPLOAD_ERROR')
      );
    } finally {
      this.uploading = false;
    }
  }

  async deleteUploadedFile(group: EducationGroup, index: number): Promise<void> {
    const file = this.filesByGroup[group][index];
    if (!file) return;

    const confirmed = await this.alertService.confirmSwal(
      this.translate.instant('FILE_DIALOG.CONFIRM_DELETE'),
      `${this.translate.instant('FILE_DIALOG.CONFIRM_DELETE_MSG')} "${file.fileName}"?`
    );

    if (!confirmed || !file.fileFullPath) return;

    this.mbaService.removeFile(file.fileFullPath).subscribe({
      next: (result) => {
        if (!result.success) {
          this.alertService.error(
            this.translate.instant('FILE_DIALOG.ERROR'),
            result.message || this.translate.instant('FILE_DIALOG.DELETE_FAILED')
          );
          return;
        }

        this.filesByGroup[group].splice(index, 1);
        const allFiles = this.flattenFiles();
        this.filesChange.emit(allFiles);
        this.onSave.emit(allFiles);
        this.alertService.successMin(this.translate.instant('FILE_DIALOG.FILE_DELETED'));
      },
      error: () => {
        this.alertService.error(
          this.translate.instant('FILE_DIALOG.ERROR'),
          this.translate.instant('FILE_DIALOG.DELETE_ERROR')
        );
      }
    });
  }

  downloadFile(file: ManagedFile): void {
    if (!file.fileFullPath) return;

    this.mbaService.downloadFile(file.fileFullPath).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.alertService.error(
          this.translate.instant('FILE_DIALOG.ERROR'),
          this.translate.instant('FILE_DIALOG.DOWNLOAD_ERROR')
        );
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileTypeLabel(fileType: string): string {
    if (fileType?.includes('pdf')) return this.translate.instant('FILE_DIALOG.TYPE_DOCUMENT');
    if (fileType?.includes('image')) return this.translate.instant('FILE_DIALOG.TYPE_IMAGE');
    return this.translate.instant('FILE_DIALOG.TYPE_FILE');
  }

  private resolveCategoriesAndLoadFiles(): void {
    this.loading = true;
    this.uploadBlocked = false;
    this.filesByGroup = { degree: [], transcript: [], recognition: [] };
    this.pendingFilesByGroup = { degree: [], transcript: [], recognition: [] };
    this.categoryIdByGroup = {};

    const activeGroups = this.getActiveGroups();

    this.mbaService.getFileCategoryCodeMap(1).subscribe({
      next: (categoryMap) => {
        for (const group of activeGroups) {
          const categoryCode = this.getCategoryCode(group);
          const category = categoryMap[categoryCode];
          if (!category?.id) {
            this.loading = false;
            this.uploadBlocked = true;
            return;
          }
          this.categoryIdByGroup[group] = category.id;
        }

        this.loadExistingFiles(activeGroups);
      },
      error: () => {
        this.loading = false;
        this.uploadBlocked = true;
      }
    });
  }

  private loadExistingFiles(activeGroups: EducationGroup[]): void {
    if (!this.studentId) {
      this.loading = false;
      this.mapIncomingFiles(this.files || []);
      this.filesChange.emit(this.flattenFiles());
      return;
    }

    const requests = activeGroups.map((group) => {
      const categoryId = this.categoryIdByGroup[group];
      if (!categoryId) {
        return of({ group, files: [] as any[] });
      }

      return this.mbaService.getFilesByCategory(this.studentId, categoryId, this.entityId).pipe(
        map((result) => ({
          group,
          files: result?.success && result?.data?.files ? result.data.files : []
        })),
        catchError(() => of({ group, files: [] as any[] }))
      );
    });

    forkJoin(requests).subscribe({
      next: (results) => {
        this.loading = false;
        for (const result of results) {
          this.filesByGroup[result.group] = this.normalizeIncomingFiles(result.files, result.group);
        }

        if (!this.flattenFiles().length && this.files?.length) {
          this.mapIncomingFiles(this.files);
        }

        this.filesChange.emit(this.flattenFiles());
      },
      error: () => {
        this.loading = false;
        if (this.files?.length) {
          this.mapIncomingFiles(this.files);
          this.filesChange.emit(this.flattenFiles());
        }
      }
    });
  }

  private mapIncomingFiles(files: any[]): void {
    for (const file of files || []) {
      const group = this.resolveGroupForIncomingFile(file);
      if (!this.getActiveGroups().includes(group)) continue;

      this.filesByGroup[group].push({
        id: file.id,
        fileName: file.fileOriginalName || file.fileName,
        fileLocalName: file.fileLocalName,
        fileSize: file.fileSize || 0,
        fileType: file.fileType || 'application/octet-stream',
        fileFullPath: file.fileFullPath,
        sortOrder: file.sortOrder || 0,
        categoryCode: file.categoryCode || this.getCategoryCode(group)
      });
    }
  }

  private resolveGroupForIncomingFile(file: any): EducationGroup {
    const categoryCode = (file?.categoryCode || file?.CategoryCode || '').toUpperCase();
    if (categoryCode === 'BDDH') return 'transcript';
    if (categoryCode === 'CNVB') return 'recognition';

    const studentFileType = Number(file?.studentFileType || file?.StudentFileType || 1);
    if (studentFileType === 2) return 'transcript';
    if (studentFileType === 3) return 'recognition';

    return 'degree';
  }

  private normalizeIncomingFiles(files: any[], group: EducationGroup): ManagedFile[] {
    return (files || []).map((file) => ({
      id: file.id,
      fileName: file.fileOriginalName || file.fileName,
      fileLocalName: file.fileLocalName,
      fileSize: file.fileSize || 0,
      fileType: file.fileType || 'application/octet-stream',
      fileFullPath: file.fileFullPath,
      sortOrder: file.sortOrder || 0,
      categoryCode: this.getCategoryCode(group)
    }));
  }

  private getActiveGroups(): EducationGroup[] {
    if (this.degreeLevel === 'postgraduate') {
      return ['degree', 'transcript'];
    }

    return this.showRecognitionForDialog ? ['degree', 'transcript', 'recognition'] : ['degree', 'transcript'];
  }

  private getCategoryCode(group: EducationGroup): string {
    if (group === 'degree') {
      return this.degreeLevel === 'undergraduate' ? 'BCDH' : 'BCCH';
    }

    if (group === 'transcript') {
      return 'BDDH';
    }

    return 'CNVB';
  }

  private flattenFiles(): ManagedFile[] {
    return [...this.filesByGroup.degree, ...this.filesByGroup.transcript, ...this.filesByGroup.recognition];
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

  private uploadByGroup(group: EducationGroup): Promise<ManagedFile[]> {
    return new Promise((resolve, reject) => {
      const categoryId = this.categoryIdByGroup[group];
      if (!categoryId || !this.studentId) {
        reject();
        return;
      }

      const formData = new FormData();
      formData.append('StudentId', this.studentId);
      formData.append('FileCategoryId', categoryId.toString());
      formData.append('StudentFileType', '1');
      if (this.entityId) {
        formData.append('EntityId', this.entityId);
      }

      const profileCode = this.tokenService.profileCode();
      if (profileCode) {
        formData.append('ProfileCode', profileCode);
      }

      this.pendingFilesByGroup[group].forEach((file) => formData.append('Files', file));

      this.mbaService.uploadAdmissionFiles(formData).subscribe({
        next: (result: any) => {
          const uploadedData = this.normalizeUploadResponse(result, group);
          resolve(uploadedData);
        },
        error: () => reject()
      });
    });
  }

  private normalizeUploadResponse(result: any, group: EducationGroup): ManagedFile[] {
    let uploadedData: any[] = [];

    if (Array.isArray(result)) {
      uploadedData = result;
    } else if (result?.data) {
      uploadedData = Array.isArray(result.data) ? result.data : [result.data];
    } else if (result?.id) {
      uploadedData = [result];
    }

    const categoryCode = this.getCategoryCode(group);
    return uploadedData.map((file: any) => ({
      id: file.id,
      fileName: file.fileOriginalName || file.fileName,
      fileLocalName: file.fileLocalName,
      fileSize: file.fileSize || 0,
      fileType: file.fileType || 'application/octet-stream',
      fileFullPath: file.fileFullPath,
      sortOrder: file.sortOrder || 0,
      categoryCode
    }));
  }
}
