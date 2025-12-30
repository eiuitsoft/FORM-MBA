import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-details-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION B - APPLICATION DETAILS</h3>
      </div>

      <div class="p-6 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Program</label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ data?.programName || data?.program || 'N/A' }}">
              {{ data?.programName || data?.program || 'N/A' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Program Code</label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ data?.programCode || 'N/A' }}">
              {{ data?.programCode || 'N/A' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Track</label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ getTrackLabel() }}">
              {{ getTrackLabel() }}
            </div>
          </div> 

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Admission Year</label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ data?.admissionYear || 'N/A' }}">
              {{ data?.admissionYear || 'N/A' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Admission Intake</label>
            <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ data?.admissionIntake || data?.intake || 'N/A' }}">
              {{ data?.admissionIntake || data?.intake || 'N/A' }}
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ApplicationDetailsViewComponent {
  @Input() data: any;

  getTrackLabel(): string {
    const track = this.data?.track;
    if (track === 0 || track === '0' || track?.toLowerCase() === 'application') return 'Application';
    if (track === 1 || track === '1' || track?.toLowerCase() === 'research') return 'Research';
    return track || 'N/A';
  }
}
