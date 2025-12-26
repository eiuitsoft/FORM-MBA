import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-employment-history-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden" [formGroup]="formGroup">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION E - EMPLOYMENT HISTORY</h3>
      </div>
      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Position 1 -->
        <div class="pl-4" formGroupName="position1">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">Position 1</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Organization</label>
              <input type="text" formControlName="organizationName" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
              <input type="text" formControlName="jobTitle" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input type="month" formControlName="fromDate" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input type="month" formControlName="toDate" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input type="text" formControlName="address" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
          </div>
        </div>

        <!-- Position 2 -->
        <div class="pl-4" formGroupName="position2">
          <h4 class="text-sm font-bold text-[#a68557] mb-3 uppercase tracking-wide">Position 2</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Organization</label>
              <input type="text" formControlName="organizationName" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
              <input type="text" formControlName="jobTitle" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input type="month" formControlName="fromDate" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input type="month" formControlName="toDate" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input type="text" formControlName="address" 
                     class="block w-full rounded border-gray-300 shadow-sm focus:border-[#a68557] focus:ring-[#a68557] px-3 py-2 text-sm">
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class EmploymentHistoryEditComponent {
  @Input() formGroup!: FormGroup;
}
