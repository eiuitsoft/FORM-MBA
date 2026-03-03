import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, forwardRef, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cdp-wrapper">
      <button type="button" class="cdp-trigger mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" (click)="toggleCalendar()" [class.cdp-has-value]="!!value">
        <span class="cdp-value text-left flex-grow">{{ displayValue || (placeholder || ('DATE_PICKER.SELECT_DATE' | translate)) }}</span>
        <svg class="cdp-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      @if (isOpen) {
      <div #backdrop class="cdp-backdrop" (click)="close()">
        <div class="cdp-modal" (click)="$event.stopPropagation()">
          <!-- Header: navigation -->
          <div class="cdp-header">
            <button type="button" class="cdp-nav-btn" (click)="prevMonth()" aria-label="Previous month">‹</button>
            <button type="button" class="cdp-month-year" (click)="toggleYearView()">
              {{ monthNames[viewMonth] }} {{ viewYear }}
            </button>
            <button type="button" class="cdp-nav-btn" (click)="nextMonth()" aria-label="Next month">›</button>
          </div>

          @if (!showYearView) {
          <!-- Day grid -->
          <div class="cdp-weekdays">
            @for (day of weekDays; track day) {
              <div class="cdp-weekday">{{ day }}</div>
            }
          </div>
          <div class="cdp-days">
            @for (day of calendarDays; track $index) {
              @if (day === 0) {
                <div class="cdp-day cdp-empty"></div>
              } @else {
                <button type="button" class="cdp-day"
                  [class.cdp-selected]="isSelected(day)"
                  [class.cdp-today]="isToday(day)"
                  (click)="selectDay(day)">
                  {{ day }}
                </button>
              }
            }
          </div>
          } @else {
          <!-- Year/Month quick select -->
          <div class="cdp-year-grid">
            @for (year of yearList; track year) {
              <button type="button" class="cdp-year-btn"
                [class.cdp-selected]="year === viewYear"
                (click)="selectYear(year)">
                {{ year }}
              </button>
            }
          </div>
          }

          <!-- Footer/Clear -->
          <div class="cdp-footer">
            @if (value) {
              <button type="button" class="cdp-clear-btn" (click)="clearValue()">✕ {{ 'DATE_PICKER.CLEAR' | translate }}</button>
            }
            <button type="button" class="cdp-close-btn" (click)="close()">{{ 'COMMON.CLOSE' | translate }}</button>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    .cdp-wrapper { width: 100%; position: relative; }
    .cdp-trigger {
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer;
      font-size: 0.875rem; line-height: 1.25rem; color: #9ca3af;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .cdp-trigger:focus { outline: none; border-color: #a68557; box-shadow: 0 0 0 2px rgba(166,133,87,0.2); }
    .cdp-trigger.cdp-has-value { color: #1f2937; }
    .cdp-icon { flex-shrink: 0; color: #9ca3af; }

    /* Portal Styles (Global due to ViewEncapsulation.None) */
    .cdp-backdrop {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 100001;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(2px);
    }
    .cdp-modal {
      position: relative;
      width: 320px; max-width: 90vw;
      background: #fff; border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      padding: 1.25rem;
      animation: cdpFadeIn 0.2s ease-out;
    }
    @keyframes cdpFadeIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .cdp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .cdp-nav-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: none; background: #f3f4f6; cursor: pointer;
      border-radius: 50%; font-size: 1.2rem; color: #374151;
    }
    .cdp-month-year {
      border: none; background: none; cursor: pointer;
      font-weight: 700; font-size: 1rem; color: #153a5e;
      padding: 0.25rem 0.5rem; border-radius: 0.375rem;
    }
    .cdp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px; }
    .cdp-weekday { text-align: center; font-size: 0.75rem; font-weight: 600; color: #9ca3af; padding: 4px 0; }
    .cdp-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .cdp-day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; border: none; background: none; cursor: pointer;
      border-radius: 0.375rem; color: #374151;
    }
    .cdp-day:hover:not(.cdp-empty):not(.cdp-selected) { background: #f3f4f6; }
    .cdp-day.cdp-today { font-weight: 700; color: #153a5e; border: 1px solid #153a5e; }
    .cdp-day.cdp-selected { background: #153a5e !important; color: #fff !important; font-weight: 600; }
    .cdp-year-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 200px; overflow-y: auto; padding: 4px 0; }
    .cdp-year-btn { padding: 8px 0; border: none; background: #f9fafb; cursor: pointer; border-radius: 0.375rem; font-size: 0.875rem; color: #374151; }
    .cdp-year-btn.cdp-selected { background: #153a5e; color: #fff; font-weight: 600; }
    .cdp-footer { border-top: 1px solid #e5e7eb; margin-top: 1rem; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; }
    .cdp-clear-btn { border: none; background: none; cursor: pointer; font-size: 0.875rem; color: #dc2626; padding: 4px 8px; border-radius: 0.25rem; }
    .cdp-close-btn { background: #f3f4f6; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: #374151; padding: 6px 12px; border-radius: 0.375rem; }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true
    }
  ]
})
export class CustomDatePickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() minYear = 1900;
  @Input() maxYear = new Date().getFullYear();
  @Input() placeholder = '';

  @ViewChild('backdrop') backdrop!: ElementRef;

  value = ''; // YYYY-MM-DD
  displayValue = '';
  isOpen = false;
  showYearView = false;

  viewMonth = new Date().getMonth();
  viewYear = new Date().getFullYear();

  calendarDays: number[] = [];
  yearList: number[] = [];
  monthNames: string[] = [];
  weekDays: string[] = [];

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
    this.buildCalendar();
    this.buildYearList();
  }

  ngOnDestroy(): void {
    this.removeBackdrop();
  }

  private loadLocaleStrings(): void {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'vi';
    if (lang === 'vi') {
      this.monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
      this.weekDays = ['CN','T2','T3','T4','T5','T6','T7'];
    } else {
      this.monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      this.weekDays = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    }
    this.updateDisplayValue();
  }

  toggleCalendar(): void {
    this.isOpen = !this.isOpen;
    this.showYearView = false;

    if (this.isOpen) {
      if (this.value) {
        const parts = this.value.split('-');
        this.viewYear = parseInt(parts[0], 10);
        this.viewMonth = parseInt(parts[1], 10) - 1;
        this.buildCalendar();
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

  toggleYearView(): void {
    this.showYearView = !this.showYearView;
    if (this.showYearView) {
      this.buildYearList();
    }
  }

  prevMonth(): void {
    this.viewMonth--;
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewMonth++;
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
    this.buildCalendar();
  }

  selectDay(day: number): void {
    const month = String(this.viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    this.value = `${this.viewYear}-${month}-${dayStr}`;
    this.updateDisplayValue();
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
  }

  selectYear(year: number): void {
    this.viewYear = year;
    this.showYearView = false;
    this.buildCalendar();
  }

  clearValue(): void {
    this.value = '';
    this.displayValue = '';
    this.onChange('');
    this.onTouched();
    this.isOpen = false;
  }

  isSelected(day: number): boolean {
    if (!this.value) return false;
    const parts = this.value.split('-');
    return parseInt(parts[0], 10) === this.viewYear
      && parseInt(parts[1], 10) - 1 === this.viewMonth
      && parseInt(parts[2], 10) === day;
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getFullYear() === this.viewYear
      && today.getMonth() === this.viewMonth
      && today.getDate() === day;
  }

  private buildCalendar(): void {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) this.calendarDays.push(0);
    for (let d = 1; d <= daysInMonth; d++) this.calendarDays.push(d);
  }

  private buildYearList(): void {
    this.yearList = [];
    for (let y = this.maxYear; y >= this.minYear; y--) this.yearList.push(y);
  }

  private updateDisplayValue(): void {
    if (this.value) {
      const parts = this.value.split('-');
      this.displayValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      this.displayValue = '';
    }
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.value) {
      const parts = this.value.split('-');
      if (parts.length === 3) {
        this.viewYear = parseInt(parts[0], 10);
        this.viewMonth = parseInt(parts[1], 10) - 1;
      }
    }
    this.updateDisplayValue();
    this.buildCalendar();
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {}
}
