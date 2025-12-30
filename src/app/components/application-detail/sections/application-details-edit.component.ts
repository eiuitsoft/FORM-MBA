import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-application-details-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION B - APPLICATION DETAILS</h3>
      </div>

      <div class="p-6 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Program</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ data?.programName || data?.program || '--' }}">
              {{ data?.programName || data?.program || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Program Code</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ data?.programCode || '--' }}">
              {{ data?.programCode || '--' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Track</label>
            <div class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed" title="{{ getTrackLabel() }}">
              {{ getTrackLabel() }}
            </div>
          </div> 

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Admission Year <span class="text-red-600">*</span></label>
            <input type="number" formControlName="admissionYear" 
                   class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm"
                   placeholder="YYYY"
                   [min]="currentYear">
            @if (formGroup.get('admissionYear')?.hasError('required') && formGroup.get('admissionYear')?.touched) {
              <p class="text-red-600 text-xs mt-1">Admission year is required</p>
            }
            @if (formGroup.get('admissionYear')?.hasError('minYear') && formGroup.get('admissionYear')?.touched) {
              <p class="text-red-600 text-xs mt-1">Admission year must be {{ currentYear }} or later</p>
            }
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Admission Intake</label>
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
    if (track === 0 || track === '0' || track?.toLowerCase() === 'application') return 'Application';
    if (track === 1 || track === '1' || track?.toLowerCase() === 'research') return 'Research';
    return track || '--';
  }
}
