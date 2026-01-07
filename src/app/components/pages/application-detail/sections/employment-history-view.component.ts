import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-employment-history-view',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.EMPLOYMENT' | translate }}</h3>
      </div>

      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Total Experience -->
        <div>
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">
            {{ 'EMPLOYMENT.TOTAL_EXPERIENCE' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.YEARS' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.totalExpYears || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.MONTHS' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.totalExpMonths || '--' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Position 1 -->
        @if (data?.position1?.organizationName) {
        <div>
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">
            {{ 'EMPLOYMENT.POSITION_1' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ORG' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position1.organizationName }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TITLE' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position1.jobTitle || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.FROM' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position1.fromDate) }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TO' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position1.toDate) }}
              </div>
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ADDRESS' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position1.address || '--' }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- Position 2 -->
        @if (data?.position2?.organizationName) {
        <div>
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">
            {{ 'EMPLOYMENT.POSITION_2' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ORG' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position2.organizationName }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TITLE' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position2.jobTitle || '--' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.FROM' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position2.fromDate) }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TO' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatMonth(data.position2.toDate) }}
              </div>
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ADDRESS' | translate }}</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.position2.address || '--' }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- No employment history -->
        @if (!hasAnyPosition()) {
        <div class="text-sm text-gray-500 italic">{{ 'EMPLOYMENT.NO_HISTORY' | translate }}</div>
        }
      </div>
    </section>
  `
})
export class EmploymentHistoryViewComponent {
  @Input() data: any;

  formatMonth(dateString: string | null): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  hasAnyPosition(): boolean {
    return !!(this.data?.position1?.organizationName || this.data?.position2?.organizationName);
  }
}
