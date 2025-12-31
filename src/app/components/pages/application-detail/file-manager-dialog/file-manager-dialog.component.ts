import { AlertService } from '@/src/app/core/services/alert/alert.service';
import { TokenService } from '@/src/app/core/services/auth/token.service';
import { MbaService } from '@/src/app/core/services/mba/mba.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-file-manager-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
    <div class="fixed inset-0 z-50 overflow-y-auto" (click)="onBackdropClick($event)">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
             (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="bg-gray-50 px-6 py-4">
            @if (loading) {
              <div class="flex items-center justify-center py-8">
                <svg class="animate-spin h-8 w-8 text-[#a68557]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-3 text-gray-600">{{ 'FILE_DIALOG.LOADING' | translate }}</span>
              </div>
            }

            @if (!loading) {
            <!-- Upload area -->
            <div class="mb-4">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-[#a68557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">{{ 'FILE_DIALOG.CLICK_TO_UPLOAD' | translate }}</span></p>
                  <p class="text-xs text-gray-500">{{ 'COMMON.FILE_HINT' | translate }}</p>
                </div>
                <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple (change)="onFileSelect($event)" />
              </label>
            </div>

            <!-- Pending files preview -->
            @if (pendingFiles.length > 0) {
              <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-gray-700">{{ 'FILE_DIALOG.SELECTED_NOT_SAVED' | translate }}</h4>
                  <span class="text-xs text-gray-500">{{ pendingFiles.length }} {{ 'FILE_DIALOG.FILES' | translate }}</span>
                </div>
                <div class="space-y-2">
                  @for (file of pendingFiles; track $index) {
                    <div class="flex items-center justify-between p-2 bg-white rounded border border-yellow-300">
                      <div class="flex items-center flex-1 min-w-0">
                        <svg class="w-5 h-5 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-gray-900 truncate">{{ file.name }}</p>
                          <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                        </div>
                      </div>
                      <button type="button" (click)="removePendingFile($index)" class="ml-2 p-1 text-red-600 hover:text-red-800 shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Save button -->
            <div class="mb-4">
              <button type="button" (click)="saveFiles()" 
                      [disabled]="uploading || pendingFiles.length === 0"
                      class="w-full flex items-center justify-center px-4 py-2 bg-[#153a5e] text-white rounded-md hover:bg-[#0f2942] disabled:bg-gray-400 disabled:cursor-not-allowed">
                @if (uploading) {
                  <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ 'FILE_DIALOG.UPLOADING' | translate }}</span>
                } @else {
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>{{ 'FILE_DIALOG.SAVE' | translate }} {{ pendingFiles.length > 0 ? '(' + pendingFiles.length + ')' : '' }}</span>
                }
              </button>
            </div>

            <!-- Uploaded files table -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">{{ 'FILE_DIALOG.NO' | translate }}</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'FILE_DIALOG.FILE_NAME' | translate }}</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">{{ 'FILE_DIALOG.FILE_TYPE' | translate }}</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{{ 'FILE_DIALOG.ACTIONS' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (file of uploadedFiles; track $index) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm text-gray-900">{{ $index + 1 }}</td>
                      <td class="px-4 py-3 text-sm text-gray-900">{{ file.fileName }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ getFileTypeLabel(file.fileType) }}</td>
                      <td class="px-4 py-3 text-sm text-center">
                        <div class="flex items-center justify-center space-x-2">
                          <button type="button" (click)="downloadFile(file)" 
                                  class="p-2 text-white bg-[#a68557] rounded hover:bg-[#8b6d47]" [title]="'FILE_DIALOG.DOWNLOAD' | translate">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button type="button" (click)="deleteUploadedFile($index)" 
                                  class="p-2 text-white bg-red-600 rounded hover:bg-red-700" [title]="'FILE_DIALOG.DELETE' | translate">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (uploadedFiles.length === 0) {
                    <tr>
                      <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500">
                        {{ 'FILE_DIALOG.NO_FILES' | translate }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            }
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" (click)="close()" 
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              {{ 'FILE_DIALOG.CLOSE' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`:host { display: contents; }`]
})

export class FileManagerDialogComponent implements OnChanges {
  private readonly _alertService = inject(AlertService);
  private readonly _mbaService = inject(MbaService);
  private readonly _tokenService = inject(TokenService);

  @Input() isOpen = false;
  @Input() title = 'File Attachments';
  @Input() files: any[] = [];
  @Input() fileCategoryId: number = 1;
  @Input() entityId?: string;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() filesChange = new EventEmitter<any[]>();
  @Output() onSave = new EventEmitter<any[]>();

  uploading = false;
  loading = false;
  pendingFiles: File[] = [];

  get studentId(): string { return this._tokenService.studentId(); }
  get uploadedFiles(): any[] { return this.files.filter(f => !f.isPending); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true && !changes['isOpen'].firstChange) {
      this.loadExistingFiles();
    }
  }

  private loadExistingFiles(): void {
    if (!this.studentId || !this.fileCategoryId) return;
    this.loading = true;
    this._mbaService.getFilesByCategory(this.studentId, this.fileCategoryId, this.entityId).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success && result.data) {
          const filesArray = result.data.files || [];
          this.files = filesArray.map((file: any) => ({
            id: file.id, fileName: file.fileOriginalName || file.fileName, fileLocalName: file.fileLocalName,
            fileSize: file.fileSize || 0, fileType: file.fileType || 'application/octet-stream',
            fileFullPath: file.fileFullPath, sortOrder: file.sortOrder || 0, isPending: false
          }));
          this.filesChange.emit(this.files);
        } else {
          this.files = [];
          this.filesChange.emit(this.files);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  onBackdropClick(): void { this.close(); }
  close(): void { this.isOpen = false; this.isOpenChange.emit(false); }

  onFileSelect(event: any): void {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) { this._alertService.error('Error', `File ${file.name} exceeds 5MB limit`); continue; }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) { this._alertService.error('Error', `File ${file.name} has invalid type`); continue; }
      this.pendingFiles.push(file);
    }
    event.target.value = '';
  }

  removePendingFile(index: number): void { this.pendingFiles.splice(index, 1); }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  saveFiles(): void {
    if (this.pendingFiles.length === 0) { this.onSave.emit(this.files); this._alertService.successMin('Saved successfully'); return; }
    this.uploading = true;
    const formData = new FormData();
    formData.append('StudentId', this.studentId);
    formData.append('FileCategoryId', this.fileCategoryId.toString());
    formData.append('StudentFileType', '1');
    this.pendingFiles.forEach(file => formData.append('Files', file));

    this._mbaService.uploadAdmissionFiles(formData).subscribe({
      next: (result: any) => {
        this.uploading = false;
        let uploadedData: any[] = Array.isArray(result) ? result : (result?.data ? (Array.isArray(result.data) ? result.data : [result.data]) : (result?.id ? [result] : []));
        if (uploadedData.length > 0) {
          this.files = this.files.filter(f => !f.isPending);
          const uploadedFiles = uploadedData.map((file: any) => ({
            id: file.id, fileName: file.fileOriginalName || file.fileName, fileLocalName: file.fileLocalName,
            fileSize: file.fileSize || 0, fileType: file.fileType, fileFullPath: file.fileFullPath, sortOrder: file.sortOrder, isPending: false
          }));
          this.files.push(...uploadedFiles);
          this.filesChange.emit(this.files);
          this.onSave.emit(this.files);
          this.pendingFiles = [];
          this._alertService.successMin(`Successfully uploaded ${uploadedFiles.length} file(s)`);
        } else {
          this._alertService.error('Error', 'Upload failed - no data returned');
        }
      },
      error: () => { this.uploading = false; this._alertService.error('Error', 'An error occurred while uploading files'); }
    });
  }

  async deleteUploadedFile(index: number): Promise<void> {
    const file = this.uploadedFiles[index];
    const confirmed = await this._alertService.confirmSwal('Confirm Delete', `Are you sure you want to delete "${file.fileName}"?`);
    if (confirmed && file.fileLocalName) {
      this._mbaService.removeFile(file.fileLocalName).subscribe({
        next: (result) => {
          if (result.success) {
            const fileIndex = this.files.findIndex(f => f.fileLocalName === file.fileLocalName);
            if (fileIndex !== -1) { this.files.splice(fileIndex, 1); this.filesChange.emit(this.files); }
            this._alertService.successMin('File deleted');
          } else { this._alertService.error('Error', result.message || 'Failed to delete file'); }
        },
        error: () => { this._alertService.error('Error', 'An error occurred while deleting file'); }
      });
    }
  }

  downloadFile(file: any): void {
    if (file.fileFullPath) {
      this._mbaService.downloadFile(file.fileFullPath).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url; link.download = file.fileName; link.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => { this._alertService.error('Error', 'Unable to download file'); }
      });
    }
  }

  getFileTypeLabel(fileType: string): string {
    if (fileType?.includes('pdf')) return 'Document';
    if (fileType?.includes('image')) return 'Image';
    return 'File';
  }
}
