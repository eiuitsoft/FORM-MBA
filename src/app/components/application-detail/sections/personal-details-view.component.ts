import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-personal-details-view',
  standalone: true,
  imports: [CommonModule, FileManagerDialogComponent],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION A - PERSONAL DETAILS</h3>
      </div>

      <div class="p-6 bg-gray-50">
        <!-- Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Full Name <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.fullName || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Nationality <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.nationalityName || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Gender <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.gender === 1 ? 'Male' : 'Female' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Date of Birth <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ formatDate(data?.dateOfBirth) }}
            </div>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Place of Birth <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.placeOfBirth || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">ID/Passport No. <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 font-mono">
              {{ data?.passportNo || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Date Issued <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ formatDate(data?.dateIssued) }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.email || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 3 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Mobile <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.mobile || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Job Title <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.jobTitle || '--' }}
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-gray-600 mb-1">Organization <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.organization || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 4 - Correspondence City & District -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Correspondence City</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.correspondenceCityName || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Correspondence District</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.correspondenceDistrictName || '--' }}
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Correspondence Address <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.correspondenceAddress || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 5 - Permanent City & District -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Permanent City</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.permanentCityName || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Permanent District</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.permanentDistrictName || '--' }}
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Permanent Address <span class="text-red-500">*</span></label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.permanentAddress || '--' }}
            </div>
          </div>
        </div>

        <!-- Upload Section -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Upload ID/Passport Document</label>
          <button type="button" (click)="openFileManager()" 
                  [class]="uploadedFiles && uploadedFiles.length > 0 
                    ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                    : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'">
            <svg class="w-5 h-5 mr-2" [class]="uploadedFiles && uploadedFiles.length > 0 ? 'text-green-600' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm font-medium" [class]="uploadedFiles && uploadedFiles.length > 0 ? 'text-green-700' : 'text-blue-700'">
              {{ uploadedFiles && uploadedFiles.length > 0 ? uploadedFiles.length + ' file(s) uploaded - Click to manage' : 'Click to upload files' }}
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1">Upload single or multiple files (PDF, JPG, or PNG, max 5MB per file)</p>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="'Manage ID/Passport Files'"
      [fileCategoryId]="1"
      [entityId]="getPersonalDetailsEntityId()"
      [(files)]="uploadedFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class PersonalDetailsViewComponent {
  @Input() data: any;
  @Input() uploadedFiles: any[] = [];
  @Output() uploadedFilesChange = new EventEmitter<any[]>();
  @Output() onFilesUpdate = new EventEmitter<any[]>();

  isFileManagerOpen = false;

  openFileManager(): void {
    this.isFileManagerOpen = true;
  }

  /**
   * Get entity ID for personal details
   * Personal details doesn't have a separate entity ID,
   * so we return undefined (files will be associated with studentId only)
   */
  getPersonalDetailsEntityId(): string | undefined {
    // Personal details files are associated with studentId, not a separate entity
    return undefined;
  }

  onFilesSaved(files: any[]): void {
    this.uploadedFiles = files;
    this.uploadedFilesChange.emit(files);
    this.onFilesUpdate.emit(files);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
