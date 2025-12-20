import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MBA_API } from '../../constants/api.const';
import { OperationResult } from '../../models/general/operation-result';
import { MBAApplication } from '../../models/mba/mba-application';
import { MBAProgram } from '../../models/mba/mba-program';
import { MBALanguage } from '../../models/mba/mba-language';
import { MBACountry } from '../../models/mba/mba-country';

@Injectable({
  providedIn: 'root'
})
export class MbaService {
  // Inject HttpClient
  private readonly _httpClient = inject(HttpClient);

  /**
   * Check xem passport/ID đã tồn tại chưa
   * Returns true nếu đã tồn tại, false nếu chưa
   */
  checkPassportExists(passportNo: string): Observable<boolean> {
    return this._httpClient.get<boolean>(MBA_API.CHECK_PASSPORT(passportNo));
  }

  /**
   * Check xem mobile đã tồn tại chưa
   * Returns true nếu đã tồn tại, false nếu chưa
   */
  checkMobileExists(mobile: string): Observable<boolean> {
    return this._httpClient.get<boolean>(MBA_API.CHECK_MOBILE(mobile));
  }

  /**
   * Tạo mới application
   */
  add(data: MBAApplication): Observable<OperationResult> {
    return this._httpClient.post<OperationResult>(MBA_API.ADD, data);
  }

  /**
   * Lấy danh sách programs đang active
   */
  getActivePrograms(): Observable<MBAProgram[]> {
    return this._httpClient.get<{ success: boolean; data: MBAProgram[] }>(MBA_API.GET_ACTIVE_PROGRAMS)
      .pipe(map(response => response.data || []));
  }

  /**
   * Lấy danh sách languages đang active
   */
  getActiveLanguages(): Observable<MBALanguage[]> {
    return this._httpClient.get<{ success: boolean; data: MBALanguage[] }>(MBA_API.GET_ACTIVE_LANGUAGES)
      .pipe(map(response => response.data || []));
  }

  /**
   * Lấy danh sách countries đang active
   */
  getActiveCountries(): Observable<MBACountry[]> {
    return this._httpClient.get<{ success: boolean; data: MBACountry[] }>(MBA_API.GET_ACTIVE_COUNTRIES)
      .pipe(map(response => response.data || []));
  }
}
