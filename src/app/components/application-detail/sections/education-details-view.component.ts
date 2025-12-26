import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-education-details-view',
  standalone: true,
  imports: [CommonModule, FileManagerDialogComponent],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION C - PREVIOUS EDUCATION DETAILS</h3>
      </div>

      <div class="p-6 bg-gray-50 space-y-6">
        <!-- Undergraduate Degrees -->
        <div>
          <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">Undergraduate Qualifications</h4>
          <div *ngIf="data?.undergraduates && data.undergraduates.length > 0; else noUndergrad">
            <div *ngFor="let degree of data.undergraduates; let i = index" 
                 class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
              <p class="text-sm font-bold text-[#a68557] mb-3 uppercase">{{ i === 0 ? 'First degree' : (i === 1 ? 'Second degree' : 'Degree ' + (i + 1)) }}</p>
              
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">University</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.university || 'N/A' }}">
                    {{ degree.university || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Country</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.countryName || 'N/A' }}">
                    {{ degree.countryName || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Major</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.major || 'N/A' }}">
                    {{ degree.major || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Graduation Year</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.graduationYear || 'N/A' }}">
                    {{ degree.graduationYear || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Language</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.languageName || 'N/A' }}">
                    {{ degree.languageName || 'N/A' }}
                  </div>
                </div>
              </div>

              <!-- Upload Button -->
              <button type="button" (click)="openFileManager('undergraduate', i)" 
                      class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="text-sm text-gray-600">
                  {{ undergraduateFiles && undergraduateFiles[i] && undergraduateFiles[i].length > 0 ? undergraduateFiles[i].length + ' file(s) uploaded - Click to manage' : 'Upload degree certificate' }}
                </span>
              </button>
            </div>
          </div>
          <ng-template #noUndergrad>
            <p class="text-sm text-gray-500 italic">No undergraduate degrees recorded</p>
          </ng-template>
        </div>

        <!-- Postgraduate Degrees -->
        <div>
          <h4 class="text-base font-bold text-[#1e3a5f] mb-4 uppercase tracking-wide border-b-2 border-[#a68557] pb-2">Postgraduate Qualifications</h4>
          <div *ngIf="data?.postgraduates && data.postgraduates.length > 0; else noPostgrad">
            <div *ngFor="let degree of data.postgraduates; let i = index" 
                 class="mb-4 pb-4 border-b border-gray-300 last:border-b-0">
              <p class="text-sm font-bold text-[#a68557] mb-3 uppercase">Degree {{ i + 1 }}</p>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">University</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.university || 'N/A' }}">
                    {{ degree.university || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Country</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.countryName || 'N/A' }}">
                    {{ degree.countryName || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Major</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.major || 'N/A' }}">
                    {{ degree.major || 'N/A' }}
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Graduation Year</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.graduationYear || 'N/A' }}">
                    {{ degree.graduationYear || 'N/A' }}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Language</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.languageName || 'N/A' }}">
                    {{ degree.languageName || 'N/A' }}
                  </div>
                </div>

                <div class="md:col-span-3">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Thesis Title</label>
                  <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 truncate" title="{{ degree.thesisTitle || 'N/A' }}">
                    {{ degree.thesisTitle || 'N/A' }}
                  </div>
                </div>
              </div>

              <!-- Upload Button -->
              <button type="button" (click)="openFileManager('postgraduate', i)" 
                      class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="text-sm text-gray-600">
                  {{ postgraduateFiles && postgraduateFiles[i] && postgraduateFiles[i].length > 0 ? postgraduateFiles[i].length + ' file(s) uploaded - Click to manage' : 'Upload degree certificate' }}
                </span>
              </button>
            </div>
          </div>
          <ng-template #noPostgrad>
            <p class="text-sm text-gray-500 italic">No postgraduate degrees recorded</p>
          </ng-template>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="currentDialogTitle"
      [fileCategoryId]="currentCategoryId"
      [(files)]="currentFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EducationDetailsViewComponent {
  @Input() data: any;
  @Input() undergraduateFiles: any[][] = [];
  @Input() postgraduateFiles: any[][] = [];
  @Output() undergraduateFilesChange = new EventEmitter<any[][]>();
  @Output() postgraduateFilesChange = new EventEmitter<any[][]>();
  @Output() onFilesUpdate = new EventEmitter<{type: string, index: number, files: any[]}>();

  isFileManagerOpen = false;
  currentDialogTitle = '';
  currentFiles: any[] = [];
  currentType = '';
  currentIndex = 0;
  currentCategoryId = 2; // Default to undergraduate

  openFileManager(type: string, index: number): void {
    this.currentType = type;
    this.currentIndex = index;
    
    if (type === 'undergraduate') {
      this.currentDialogTitle = `Manage Undergraduate Degree ${index + 1} Files`;
      this.currentFiles = this.undergraduateFiles[index] || [];
      this.currentCategoryId = 2; // BCDH - Undergraduate
    } else {
      this.currentDialogTitle = `Manage Postgraduate Degree ${index + 1} Files`;
      this.currentFiles = this.postgraduateFiles[index] || [];
      this.currentCategoryId = 3; // BCCH - Postgraduate
    }
    
    this.isFileManagerOpen = true;
  }

  onFilesSaved(files: any[]): void {
    if (this.currentType === 'undergraduate') {
      const updated = [...this.undergraduateFiles];
      updated[this.currentIndex] = files;
      this.undergraduateFiles = updated;
      this.undergraduateFilesChange.emit(updated);
    } else {
      const updated = [...this.postgraduateFiles];
      updated[this.currentIndex] = files;
      this.postgraduateFiles = updated;
      this.postgraduateFilesChange.emit(updated);
    }
    
    this.onFilesUpdate.emit({
      type: this.currentType,
      index: this.currentIndex,
      files: files
    });
  }
}
