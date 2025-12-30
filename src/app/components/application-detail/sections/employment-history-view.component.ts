import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employment-history-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION E - EMPLOYMENT HISTORY</h3>
      </div>

      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Position 1 -->
        <div *ngIf="data?.position1?.organizationName">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">Position 1</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Organization</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position1.organizationName }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position1.jobTitle || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">From</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position1.fromDate) }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">To</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position1.toDate) }}
              </div>
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position1.address || '--' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Position 2 -->
        <div *ngIf="data?.position2?.organizationName">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">Position 2</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Organization</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position2.organizationName }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position2.jobTitle || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">From</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position2.fromDate) }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">To</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position2.toDate) }}
              </div>
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position2.address || '--' }}
              </div>
            </div>
          </div>
        </div>

        <!-- No employment history -->
        <div *ngIf="!hasAnyPosition()" class="text-sm text-gray-500 italic">
          No employment history recorded
        </div>
      </div>
    </section>
  `
})
export class EmploymentHistoryViewComponent {
  @Input() data: any;

  formatMonth(dateString: string | null): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${month}/${year}`;
  }

  hasAnyPosition(): boolean {
    return !!(
      this.data?.position1?.organizationName ||
      this.data?.position2?.organizationName
    );
  }
}
