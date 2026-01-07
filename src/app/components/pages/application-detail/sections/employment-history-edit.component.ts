import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-employment-history-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">{{ 'SECTIONS.EMPLOYMENT' | translate }}</h3>
      </div>
      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Total Experience -->
        <div class="pl-4">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">
            {{ 'EMPLOYMENT.TOTAL_EXPERIENCE' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >{{ 'EMPLOYMENT.YEARS' | translate }} <span class="text-red-600">*</span></label
              >
              <input
                type="number"
                formControlName="totalExpYears"
                min="0"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
              @if (formGroup.get('totalExpYears')?.hasError('required') && formGroup.get('totalExpYears')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'EMPLOYMENT.YEARS_REQUIRED' | translate }}</p>
              } @if (formGroup.get('totalExpYears')?.hasError('min') && formGroup.get('totalExpYears')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'EMPLOYMENT.YEARS_MIN' | translate }}</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >{{ 'EMPLOYMENT.MONTHS' | translate }} <span class="text-red-600">*</span></label
              >
              <input
                type="number"
                formControlName="totalExpMonths"
                min="0"
                max="12"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
              @if (formGroup.get('totalExpMonths')?.hasError('required') && formGroup.get('totalExpMonths')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'EMPLOYMENT.MONTHS_REQUIRED' | translate }}</p>
              } @if (formGroup.get('totalExpMonths')?.hasError('min') && formGroup.get('totalExpMonths')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'EMPLOYMENT.MONTHS_MIN' | translate }}</p>
              } @if (formGroup.get('totalExpMonths')?.hasError('max') && formGroup.get('totalExpMonths')?.touched) {
              <p class="text-red-600 text-xs mt-1">{{ 'EMPLOYMENT.MONTHS_MAX' | translate }}</p>
              }
            </div>
          </div>
        </div>

        <!-- Position 1 -->
        <div class="pl-4" formGroupName="position1">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">
            {{ 'EMPLOYMENT.POSITION_1' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ORG' | translate }}</label>
              <input
                type="text"
                formControlName="organizationName"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TITLE' | translate }}</label>
              <input
                type="text"
                formControlName="jobTitle"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.FROM' | translate }}</label>
              <input
                type="month"
                formControlName="fromDate"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TO' | translate }}</label>
              <input
                type="month"
                formControlName="toDate"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ADDRESS' | translate }}</label>
              <input
                type="text"
                formControlName="address"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <!-- Position 2 -->
        <div class="pl-4" formGroupName="position2">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">
            {{ 'EMPLOYMENT.POSITION_2' | translate }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ORG' | translate }}</label>
              <input
                type="text"
                formControlName="organizationName"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TITLE' | translate }}</label>
              <input
                type="text"
                formControlName="jobTitle"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.FROM' | translate }}</label>
              <input
                type="month"
                formControlName="fromDate"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.TO' | translate }}</label>
              <input
                type="month"
                formControlName="toDate"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'EMPLOYMENT.ADDRESS' | translate }}</label>
              <input
                type="text"
                formControlName="address"
                class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class EmploymentHistoryEditComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  ngOnInit(): void {
    // logs form group for debugging
    console.log('🚀 ~ EmploymentHistoryEditComponent ~ ngOnInit ~ formGroup:', this.formGroup.get('totalExpYears'));
  }
}
