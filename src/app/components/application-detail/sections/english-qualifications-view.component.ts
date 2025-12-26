import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileManagerDialogComponent } from '../file-manager-dialog/file-manager-dialog.component';

@Component({
  selector: 'app-english-qualifications-view',
  standalone: true,
  imports: [CommonModule, FileManagerDialogComponent],
  template: `
    <section class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-[#1e3a5f]">
        <h3 class="text-lg font-bold text-white tracking-wide">SECTION D - ENGLISH QUALIFICATIONS</h3>
      </div>

      <div class="p-6 bg-gray-50 space-y-4">
        <!-- IELTS -->
        <div *ngIf="data?.ielts?.score">
          <h4 class="text-sm font-bold text-[#a68557] mb-2 uppercase tracking-wide">IELTS</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.ielts.score }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatDate(data.ielts.date) }}
              </div>
            </div>
          </div>
        </div>

        <!-- TOEFL -->
        <div *ngIf="data?.toefl?.score">
          <h4 class="text-sm font-bold text-[#a68557] mb-2 uppercase tracking-wide">TOEFL</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.toefl.score }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatDate(data.toefl.date) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Other -->
        <div *ngIf="data?.other?.name">
          <h4 class="text-sm font-bold text-[#a68557] mb-2 uppercase tracking-wide">{{ data.other.name }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Score</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ data.other.score || 'N/A' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <div class="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900">
                {{ formatDate(data.other.date) }}
              </div>
            </div>
          </div>
        </div>

        <!-- No qualifications -->
        <div *ngIf="!hasAnyQualification()" class="text-sm text-gray-500 italic">
          No English qualifications recorded
        </div>

        <!-- Upload English Certificates Button -->
        <div class="pt-2">
          <label class="block text-xs font-medium text-gray-600 mb-2">Upload English Certificates</label>
          <button type="button" (click)="openFileManager()" 
                  class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm text-gray-600">
              {{ englishFiles && englishFiles.length > 0 ? englishFiles.length + ' file(s) uploaded - Click to manage' : 'Upload English certificates' }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- File Manager Dialog -->
    <app-file-manager-dialog
      [(isOpen)]="isFileManagerOpen"
      [title]="'Manage English Certificate Files'"
      [fileCategoryId]="4"
      [(files)]="englishFiles"
      (onSave)="onFilesSaved($event)">
    </app-file-manager-dialog>
  `
})
export class EnglishQualificationsViewComponent {
  @Input() data: any;
  @Input() englishFiles: any[] = [];
  @Output() englishFilesChange = new EventEmitter<any[]>();
  @Output() onFilesUpdate = new EventEmitter<any[]>();

  isFileManagerOpen = false;

  openFileManager(): void {
    this.isFileManagerOpen = true;
  }

  onFilesSaved(files: any[]): void {
    this.englishFiles = files;
    this.englishFilesChange.emit(files);
    this.onFilesUpdate.emit(files);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  hasAnyQualification(): boolean {
    return !!(
      this.data?.ielts?.score ||
      this.data?.toefl?.score ||
      this.data?.other?.name
    );
  }
}
