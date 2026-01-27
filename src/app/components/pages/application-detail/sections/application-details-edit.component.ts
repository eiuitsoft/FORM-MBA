import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-application-details-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.APPLICATION' | translate }}</h3>
      </div>

      <div class="p-6 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'APPLICATION_DETAILS.PROGRAM_NAME' | translate }}</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ data?.programName || data?.program || '--' }}">
              {{ data?.programName || data?.program || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'APPLICATION_DETAILS.PROGRAM_CODE' | translate }}</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ data?.programCode || '--' }}">
              {{ data?.programCode || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'APPLICATION_DETAILS.TRACK' | translate }}</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ getTrackLabel() | translate }}">
              {{ getTrackLabel() | translate }}
            </div>
          </div> 

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'APPLICATION_DETAILS.ADMISSION_YEAR' | translate }} <span class="text-red-600">*</span></label>
            <input type="number" formControlName="admissionYear" 
                   class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm"
                   placeholder="YYYY"
                   [min]="currentYear">
            @if (formGroup.get('admissionYear')?.hasError('required') && formGroup.get('admissionYear')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'APPLICATION_DETAILS.ADMISSION_YEAR' | translate }} {{ 'COMMON.REQUIRED_FIELD' | translate }}</p>
            }
            @if (formGroup.get('admissionYear')?.hasError('minYear') && formGroup.get('admissionYear')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'APPLICATION_DETAILS.ADMISSION_YEAR_MIN' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'APPLICATION_DETAILS.ADMISSION_INTAKE' | translate }}</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ data?.admissionIntake || data?.intake || '--' }}">
              {{ data?.admissionIntake || data?.intake || '--' }}
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ApplicationDetailsEditComponent {
  @Input() formGroup!: FormGroup;
  @Input() data: any;
  
  currentYear = new Date().getFullYear();

  getTrackLabel(): string {
    const track = this.data?.track;
    if (track === 0 || track === '0' || track?.toLowerCase() === 'application') return 'APPLICATION_DETAILS.APPLICATION';
    if (track === 1 || track === '1' || track?.toLowerCase() === 'research') return 'APPLICATION_DETAILS.RESEARCH';
    return track || '--';
  }
}
