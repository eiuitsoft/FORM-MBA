import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MBA_API } from '../../constants/api.const';
import { OperationResult } from '../../models/general/operation-result';
import { MBAApplication } from '../../models/mba/mba-application';

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
}
