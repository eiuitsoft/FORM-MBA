
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRootComponent } from './src/app/app-root.component';
import { routes } from './src/app/app.routes';
import { authInterceptor } from './src/app/core/interceptors/auth.interceptor';

bootstrapApplication(AppRootComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withHashLocation()),
    importProvidersFrom(ReactiveFormsModule),
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      // Check localStorage first, then browser lang, fallback to 'vi'
      const savedLang = localStorage.getItem('lang');
      const lang = savedLang || translate.getBrowserLang() || 'vi';
      translate.use(lang);
    })
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
