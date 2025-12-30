import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-10 mx-auto">
          <main class="mt-4">
            <ng-content />
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      padding: 0;
    }
    main {
      min-height: calc(100vh - 200px);
    }
  `]
})
export class PageLayoutComponent {}
