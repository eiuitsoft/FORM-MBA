import { environment } from '../../../environments/environment';

// Base API URL
export const BASE_API_URL = environment.API_URL;

// MBA Application endpoints
export const MBA_API = {
  ADD: `${BASE_API_URL}/MBAForm/Add`,
  UPDATE: (id: string) => `${BASE_API_URL}/MBAForm/Update/${id}`,
  GET_BY_ID: (id: string) => `${BASE_API_URL}/MBAForm/GetById/${id}`,
  CHECK_PASSPORT: (passportNo: string) =>
    `${BASE_API_URL}/MBAForm/CheckPassport/check-passport/${passportNo}`,
  CHECK_MOBILE: (mobile: string) =>
    `${BASE_API_URL}/MBAForm/CheckMobile/check-mobile/${mobile}`,
  GET_ACTIVE_PROGRAMS: `${BASE_API_URL}/MBAProgram/GetActive`,
  GET_ACTIVE_LANGUAGES: `${BASE_API_URL}/MBALanguage/GetActive`,
  GET_ACTIVE_COUNTRIES: `${BASE_API_URL}/MBACountry/GetActive`,
  EXPORT_TO_PDF: (id: string, language: string = 'en') => `${BASE_API_URL}/MBAForm/ExportToWord/${id}/export-word?type=pdf&language=${language}`,
  
  // TODO: Implement these APIs on backend
  GET_ACTIVE_CITIES: `${BASE_API_URL}/MBACity/GetActive`, // Not implemented yet
  SEND_EMAIL_WITH_PDF: (language: string = 'en') => `${BASE_API_URL}/MBAForm/SendEmailWithPDF?language=${language}`,
};

// Authentication endpoints
export const AUTH_API = {
  SEND_OTP: `${BASE_API_URL}/MBAForm/SendOTP/send-otp`,
  LOGIN_OTP: `${BASE_API_URL}/MBAForm/LoginWithOTP/login-otp`,
};

// Main/Address endpoints
export const MAIN_API = {
  GET_ALL_CITY: `${BASE_API_URL}/Main/GetAllCity`,
  GET_ALL_DISTINCT_BY_CITY: (cityCode: string) =>
    `${BASE_API_URL}/Main/GetAllDistinctByCity?cityCode=${cityCode}`,
};

// Administrative Unit endpoints
export const ADMINISTRATIVE_API = {
  GET_PROVINCES: `${BASE_API_URL}/MBAAdministrativeUnit/GetProvinces/provinces`,
  GET_WARDS_BY_PROVINCE: (provinceCode: string) =>
    `${BASE_API_URL}/MBAAdministrativeUnit/GetWardsByProvinceCode/wards/${provinceCode}`,
  GET_BY_ID: (id: number) => `${BASE_API_URL}/MBAAdministrativeUnit/GetById/${id}`,
};

// File Management endpoints
export const FILE_API = {
  UPLOAD_ADMISSION_FILES: `${BASE_API_URL}/MBAFile/UploadAdmissionMultiFile`,
  DOWNLOAD_FILE: (fileUrl: string) => `${BASE_API_URL}/MBAFile/DownloadFile?fileUrl=${encodeURIComponent(fileUrl)}`,
  REMOVE_FILE: (pathFile: string) => `${BASE_API_URL}/MBAFile/RemoveFile?pathFile=${encodeURIComponent(pathFile)}`,
  GET_FILES_BY_CATEGORY: (studentId: string, categoryId: number, entityId?: string) => 
    `${BASE_API_URL}/MBAFileData/GetFilesByCategory/files/${studentId}/${categoryId}${entityId ? '?entityId=' + entityId : ''}`,
};
