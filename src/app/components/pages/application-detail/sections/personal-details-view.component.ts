import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-personal-details-view',
  standalone: true,
  imports: [CommonModule, FileManagerDialogComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.PERSONAL' | translate }}</h3>
      </div>

      <div class="p-6 bg-gray-50">
        <!-- Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.FULL_NAME' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.fullName || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.NATIONALITY' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ getNationalityName() }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.GENDER' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.gender === 1 ? ('PERSONAL_DETAILS.MALE' | translate) : data?.gender === 2 ? ('PERSONAL_DETAILS.FEMALE' | translate) : '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.DOB' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ (data?.dateOfBirth | date : 'dd/MM/yyyy') || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.POB' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.placeOfBirth || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.PASSPORT' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 font-mono">
              {{ data?.passportNo || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.DATE_ISSUED' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ (data?.dateIssued | date : 'dd/MM/yyyy') || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.PLACE_OF_ISSUE' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.passportPlaceIssued || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 3 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.EMAIL' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.email || '--' }}
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.MOBILE' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.mobile || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.JOB_TITLE' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.jobTitle || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.ORGANIZATION' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.organization || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 4 - Correspondence City & District -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{
                'PERSONAL_DETAILS.CORR_CITY' | translate
              }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.correspondenceCityName || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{
                'PERSONAL_DETAILS.CORR_WARD' | translate
              }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.correspondenceDistrictName || '--' }}
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.CORR_ADDRESS' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.correspondenceAddress || '--' }}
            </div>
          </div>
        </div>

        <!-- Row 5 - Permanent City & District -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{
                'PERSONAL_DETAILS.PERM_CITY' | translate
              }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.permanentCityName || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{
                'PERSONAL_DETAILS.PERM_WARD' | translate
              }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data?.permanentDistrictName || '--' }}
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >{{ 'PERSONAL_DETAILS.PERM_ADDRESS' | translate }} <span class="text-red-500">*</span></label
            >
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
              {{ data?.permanentAddress || '--' }}
            </div>
          </div>
        </div>

        <!-- Upload Section -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">{{
            'PERSONAL_DETAILS.UPLOAD_PASSPORT' | translate
          }}</label>
          <button
            type="button"
            (click)="openFileManager()"
            [class]="
              uploadedFiles && uploadedFiles.length > 0
                ? 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-400 rounded bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors'
                : 'w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors'
            ">
            <svg
              class="w-5 h-5 mr-2"
              [class]="uploadedFiles && uploadedFiles.length > 0 ? 'text-green-600' : 'text-blue-500'"
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
              [class]="uploadedFiles && uploadedFiles.length > 0 ? 'text-green-700' : 'text-blue-700'">
              {{
                uploadedFiles && uploadedFiles.length > 0
                  ? uploadedFiles.length + ' ' + ('COMMON.FILE_SELECTED' | translate)
                  : ('COMMON.FILE_UPLOAD' | translate)
              }}
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1">{{ 'COMMON.FILE_HINT' | translate }}</p>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="dialogTitle"
      [fileCategoryId]="1"
      [(files)]="uploadedFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class PersonalDetailsViewComponent {
  private readonly translate = inject(TranslateService);

  @Input() data: any;
  @Input() countries: any[] = [];
  @Input() uploadedFiles: any[] = [];
  @Output() uploadedFilesChange = new EventEmitter<any[]>();
  @Output() onFilesUpdate = new EventEmitter<any[]>();

  isFileManagerOpen = false;
  dialogTitle = '';

  get isLangVi(): boolean {
    return (localStorage.getItem('lang') || 'vi') === 'vi';
  }

  getNationalityName(): string {
    if (!this.data?.nationalityId) return '--';
    const country = this.countries.find((c) => c.id === this.data.nationalityId);
    if (country) {
      return this.isLangVi ? country.name : country.name_EN;
    }
    return this.data?.nationalityName || '--';
  }

  openFileManager(): void {
    this.dialogTitle = this.translate.instant('FILE_DIALOG.TITLE_PASSPORT');
    this.isFileManagerOpen = true;
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
