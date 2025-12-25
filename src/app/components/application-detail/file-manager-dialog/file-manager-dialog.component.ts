import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert/alert.service';

@Component({
  selector: 'app-file-manager-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" (click)="onBackdropClick($event)">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

        <!-- Center modal -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
             (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="bg-gray-50 px-6 py-4">
            <!-- Upload area -->
            <div class="mb-4">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-[#a68557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Tải lên tệp đính kèm</span></p>
                  <p class="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                </div>
                <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple (change)="onFileSelect($event)" />
              </label>
            </div>

            <!-- Save button -->
            <div class="mb-4">
              <button type="button" (click)="saveFiles()" 
                      class="w-full flex items-center justify-center px-4 py-2 bg-[#153a5e] text-white rounded-md hover:bg-[#0f2942]">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Lưu lại
              </button>
            </div>

            <!-- File list table -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tệp</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Loại tệp</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let file of files; let i = index" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ i + 1 }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ file.fileName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ getFileTypeLabel(file.fileType) }}</td>
                    <td class="px-4 py-3 text-sm text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <button type="button" (click)="downloadFile(file)" 
                                class="p-2 text-white bg-[#a68557] rounded hover:bg-[#8b6d47]" title="Tải xuống">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button type="button" (click)="deleteFile(i)" 
                                class="p-2 text-white bg-red-600 rounded hover:bg-red-700" title="Xóa">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="files.length === 0">
                    <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500">
                      Chưa có tệp đính kèm nào
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" (click)="close()" 
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class FileManagerDialogComponent {
  private readonly _alertService = inject(AlertService);
  
  @Input() isOpen = false;
  @Input() title = 'Tệp đính kèm';
  @Input() files: any[] = [];
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() filesChange = new EventEmitter<any[]>();
  @Output() onSave = new EventEmitter<any[]>();

  onBackdropClick(event: MouseEvent): void {
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onFileSelect(event: any): void {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this._alertService.error('Lỗi', `File ${file.name} vượt quá 5MB`);
          continue;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          this._alertService.error('Lỗi', `File ${file.name} không đúng định dạng. Chỉ chấp nhận PDF, JPG, PNG`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64 = e.target.result.split(',')[1];
          this.files.push({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: base64
          });
          this.filesChange.emit(this.files);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input
    event.target.value = '';
  }

  async deleteFile(index: number): Promise<void> {
    const confirmed = await this._alertService.confirmSwal(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa file này?'
    );
    
    if (confirmed) {
      this.files.splice(index, 1);
      this.filesChange.emit(this.files);
      this._alertService.successMin('Đã xóa file');
    }
  }

  downloadFile(file: any): void {
    // Create download link
    const linkSource = `data:${file.fileType};base64,${file.fileData}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = file.fileName;
    downloadLink.click();
  }

  saveFiles(): void {
    this.onSave.emit(this.files);
    this._alertService.successMin('Đã lưu thành công');
    // Optionally close dialog after save
    // this.close();
  }

  getFileTypeLabel(fileType: string): string {
    if (fileType.includes('pdf')) return 'Minh chứng học bổng';
    if (fileType.includes('image')) return 'Minh chứng học bổng';
    return 'Minh chứng học bổng';
  }
}
