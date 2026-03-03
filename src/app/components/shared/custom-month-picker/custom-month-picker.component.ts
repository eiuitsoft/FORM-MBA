import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, forwardRef, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-month-picker',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cmp-wrapper">
      <button type="button" class="cmp-trigger block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" (click)="toggleDropdown()" [class.cmp-has-value]="!!value">
        <span class="cmp-value text-left flex-grow">{{ displayValue || (placeholder || ('DATE_PICKER.SELECT_MONTH' | translate)) }}</span>
        <svg class="cmp-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      @if (isOpen) {
      <div #backdrop class="cmp-backdrop" (click)="close()">
        <div class="cmp-modal" (click)="$event.stopPropagation()">
          <!-- Year navigation -->
          <div class="cmp-header">
            <button type="button" class="cmp-nav-btn" (click)="prevYear()" aria-label="Previous year">‹</button>
            <span class="cmp-year-display">{{ viewYear }}</span>
            <button type="button" class="cmp-nav-btn" (click)="nextYear()" aria-label="Next year">›</button>
          </div>

          <!-- Month grid -->
          <div class="cmp-grid">
            @for (m of monthList; track m.value) {
              <button type="button" class="cmp-month-btn"
                [class.cmp-selected]="isSelected(m.value)"
                (click)="selectMonth(m.value)">
                {{ m.label }}
              </button>
            }
          </div>

          <!-- Footer/Clear -->
          <div class="cmp-footer">
            @if (value) {
              <button type="button" class="cmp-clear-btn" (click)="clearValue()">✕ {{ 'DATE_PICKER.CLEAR' | translate }}</button>
            }
            <button type="button" class="cmp-close-btn" (click)="close()">{{ 'COMMON.CLOSE' | translate }}</button>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    .cmp-wrapper { width: 100%; position: relative; }
    .cmp-trigger {
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer;
      line-height: 1.5rem; color: #9ca3af;
      background: #fff;
    }
    .cmp-trigger:focus { outline: none; border-color: #a68557; box-shadow: 0 0 0 2px rgba(166,133,87,0.2); }
    .cmp-trigger.cmp-has-value { color: #1f2937; }
    .cmp-icon { flex-shrink: 0; color: #9ca3af; }

    /* Portal Styles (Global due to ViewEncapsulation.None) */
    .cmp-backdrop {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 100001;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(2px);
    }
    .cmp-modal {
      position: relative;
      width: 280px; max-width: 90vw;
      background: #fff; border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      padding: 1.25rem;
      animation: cmpFadeIn 0.2s ease-out;
    }
    @keyframes cmpFadeIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .cmp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .cmp-nav-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: none; background: #f3f4f6; cursor: pointer;
      border-radius: 50%; font-size: 1.2rem; color: #374151;
    }
    .cmp-year-display { font-weight: 700; font-size: 1.125rem; color: #153a5e; }
    .cmp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .cmp-month-btn { padding: 12px 0; border: none; background: #f9fafb; cursor: pointer; border-radius: 0.5rem; font-size: 0.875rem; color: #374151; transition: background 0.1s; }
    .cmp-month-btn.cmp-selected { background: #153a5e; color: #fff; font-weight: 600; }
    .cmp-footer { border-top: 1px solid #e5e7eb; margin-top: 1rem; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; }
    .cmp-clear-btn { border: none; background: none; cursor: pointer; font-size: 0.875rem; color: #dc2626; }
    .cmp-close-btn { background: #f3f4f6; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 6px 12px; border-radius: 0.375rem; }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMonthPickerComponent),
      multi: true
    }
  ]
})
export class CustomMonthPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder = '';

  @ViewChild('backdrop') backdrop!: ElementRef;

  value = ''; // YYYY-MM
  displayValue = '';
  isOpen = false;
  viewYear = new Date().getFullYear();

  monthList: { value: number; label: string }[] = [];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadLocaleStrings();
    this.translate.onLangChange.subscribe(() => this.loadLocaleStrings());
  }

  ngOnDestroy(): void {
    this.removeBackdrop();
  }

  private loadLocaleStrings(): void {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'vi';
    const monthNames = lang === 'vi' 
      ? ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    this.monthList = monthNames.map((name, i) => ({ value: i, label: name }));
    this.updateDisplayValue();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      if (this.value) {
        const parts = this.value.split('-');
        this.viewYear = parseInt(parts[0], 10);
      }

      // Move backdrop to body to avoid parent clipping
      setTimeout(() => {
        if (this.backdrop) {
          this.renderer.appendChild(this.document.body, this.backdrop.nativeElement);
        }
      });
    } else {
      this.removeBackdrop();
    }
  }

  close(): void {
    this.isOpen = false;
    this.removeBackdrop();
    this.onTouched();
  }

  private removeBackdrop(): void {
    if (this.backdrop?.nativeElement.parentNode === this.document.body) {
      this.renderer.removeChild(this.document.body, this.backdrop.nativeElement);
    }
  }

  prevYear(): void { this.viewYear--; }
  nextYear(): void { this.viewYear++; }

  selectMonth(month: number): void {
    const m = String(month + 1).padStart(2, '0');
    this.value = `${this.viewYear}-${m}`;
    this.updateDisplayValue();
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
    this.removeBackdrop();
  }

  clearValue(): void {
    this.value = '';
    this.displayValue = '';
    this.onChange('');
    this.onTouched();
    this.isOpen = false;
    this.removeBackdrop();
  }

  isSelected(month: number): boolean {
    if (!this.value) return false;
    const parts = this.value.split('-');
    return parseInt(parts[0], 10) === this.viewYear && parseInt(parts[1], 10) - 1 === month;
  }

  private updateDisplayValue(): void {
    if (this.value) {
      const parts = this.value.split('-');
      this.displayValue = `${parts[1]}/${parts[0]}`;
    } else {
      this.displayValue = '';
    }
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.value) {
      const parts = this.value.split('-');
      this.viewYear = parseInt(parts[0], 10);
    }
    this.updateDisplayValue();
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
