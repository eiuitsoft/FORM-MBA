import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MBA_API, MAIN_API, ADMINISTRATIVE_API, FILE_API } from '../../constants/api.const';
import { OperationResult } from '../../models/general/operation-result';
import { MBAApplication } from '../../models/mba/mba-application';
import { MBAProgram } from '../../models/mba/mba-program';
import { MBALanguage } from '../../models/mba/mba-language';
import { MBACountry } from '../../models/mba/mba-country';
import { MBACity } from '../../models/mba/mba-city';
import { City, District } from '../../models/mba/mba-address';
import { Province } from '../../models/administrative/province';
import { Ward } from '../../models/administrative/ward';

@Injectable({
  providedIn: 'root'
})
export class MbaService {
  // Inject HttpClient
  private readonly _httpClient = inject(HttpClient);

  /**
   * Check if passport/ID already exists
   * Returns true if exists, false if not
   */
  checkPassportExists(passportNo: string): Observable<boolean> {
    return this._httpClient.get<boolean>(MBA_API.CHECK_PASSPORT(passportNo));
  }

  /**
   * Check if mobile already exists
   * Returns true if exists, false if not
   */
  checkMobileExists(mobile: string): Observable<boolean> {
    return this._httpClient.get<boolean>(MBA_API.CHECK_MOBILE(mobile));
  }

  /**
   * Create new application with multipart/form-data
   */
  add(formData: FormData): Observable<OperationResult> {
    // No need to set Content-Type header, browser automatically sets it for multipart/form-data
    return this._httpClient.post<OperationResult>(MBA_API.ADD, formData);
  }

  /**
   * Update application
   */
  update(id: string, data: MBAApplication): Observable<OperationResult> {
    return this._httpClient.put<OperationResult>(MBA_API.UPDATE(id), data);
  }

  /**
   * Get application information by ID
   */
  getById(id: string): Observable<any> {
    return this._httpClient.get<{ success: boolean; data: any }>(MBA_API.GET_BY_ID(id))
      .pipe(map(response => response.data));
  }

  /**
   * Get list of active programs
   */
  getActivePrograms(): Observable<MBAProgram[]> {
    return this._httpClient.get<{ success: boolean; data: MBAProgram[] }>(MBA_API.GET_ACTIVE_PROGRAMS)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get list of active languages
   */
  getActiveLanguages(): Observable<MBALanguage[]> {
    return this._httpClient.get<{ success: boolean; data: MBALanguage[] }>(MBA_API.GET_ACTIVE_LANGUAGES)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get list of active countries
   */
  getActiveCountries(): Observable<MBACountry[]> {
    return this._httpClient.get<{ success: boolean; data: MBACountry[] }>(MBA_API.GET_ACTIVE_COUNTRIES)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get list of active cities
   */
  getActiveCities(): Observable<MBACity[]> {
    return this._httpClient.get<{ success: boolean; data: MBACity[] }>(MBA_API.GET_ACTIVE_CITIES)
      .pipe(map(response => response.data || []));
  }

  /**
   * Send email with PDF attachment
   */
  sendEmailWithPDF(data: any, pdfBlob: Blob): Observable<OperationResult> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('pdf', pdfBlob, 'mba-application.pdf');
    
    return this._httpClient.post<OperationResult>(MBA_API.SEND_EMAIL_WITH_PDF, formData);
  }

  /**
   * Get list of all cities/provinces
   */
  getAllCities(): Observable<City[]> {
    return this._httpClient.get<City[] | { success: boolean; data: City[] }>(MAIN_API.GET_ALL_CITY)
      .pipe(
        map(response => {
          // Check if response is wrapped in success/data structure
          if (response && typeof response === 'object' && 'data' in response) {
            return response.data || [];
          }
          // Otherwise assume it's direct array
          return Array.isArray(response) ? response : [];
        })
      );
  }

  /**
   * Get list of districts by city code
   */
  getDistrictsByCity(cityCode: string): Observable<District[]> {
    return this._httpClient.get<District[] | { success: boolean; data: District[] }>(MAIN_API.GET_ALL_DISTINCT_BY_CITY(cityCode))
      .pipe(
        map(response => {
          // Check if response is wrapped in success/data structure
          if (response && typeof response === 'object' && 'data' in response) {
            return response.data || [];
          }
          // Otherwise assume it's direct array
          return Array.isArray(response) ? response : [];
        })
      );
  }

  /**
   * Get list of provinces (cities)
   */
  getProvinces(): Observable<Province[]> {
    return this._httpClient.get<Province[]>(ADMINISTRATIVE_API.GET_PROVINCES);
  }

  /**
   * Get ward information by ID
   */
  getWardById(id: number): Observable<Ward> {
    return this._httpClient.get<Ward>(ADMINISTRATIVE_API.GET_BY_ID(id));
  }

  /**
   * Get list of wards (districts) by province code
   */
  getWardsByProvinceCode(provinceCode: string): Observable<Ward[]> {
    return this._httpClient.get<Ward[]>(ADMINISTRATIVE_API.GET_WARDS_BY_PROVINCE(provinceCode));
  }

  /**
   * Get files by category for a student
   */
  getFilesByCategory(studentId: string, categoryId: number): Observable<any> {
    return this._httpClient.get<any>(FILE_API.GET_FILES_BY_CATEGORY(studentId, categoryId));
  }

  /**
   * Upload multiple files for student (used for Update/Edit)
   * Note: API returns array directly, not wrapped in OperationResult
   */
  uploadAdmissionFiles(formData: FormData): Observable<any> {
    // Don't set Content-Type header - let browser set it with boundary
    return this._httpClient.post<any>(
      FILE_API.UPLOAD_ADMISSION_FILES, 
      formData
      // No headers needed - browser will auto-set multipart/form-data with boundary
    );
  }

  /**
   * Download file from server
   */
  downloadFile(fileUrl: string): Observable<Blob> {
    return this._httpClient.get(FILE_API.DOWNLOAD_FILE(fileUrl), {
      responseType: 'blob'
    });
  }

  /**
   * Remove file from server
   */
  removeFile(fileLocalName: string): Observable<OperationResult> {
    return this._httpClient.delete<OperationResult>(FILE_API.REMOVE_FILE(fileLocalName));
  }
}