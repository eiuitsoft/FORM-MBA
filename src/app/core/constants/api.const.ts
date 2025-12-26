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
  
  // TODO: Implement these APIs on backend
  GET_ACTIVE_CITIES: `${BASE_API_URL}/MBACity/GetActive`, // Not implemented yet
  SEND_EMAIL_WITH_PDF: `${BASE_API_URL}/MBAForm/SendEmailWithPDF`, // Not implemented yet
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
  GET_FILES_BY_CATEGORY: (studentId: string, categoryId: number) => 
    `${BASE_API_URL}/MBAFileData/GetFilesByCategory/files/${studentId}/${categoryId}`,
};
