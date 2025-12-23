import { environment } from '../../../environments/environment';

// Base API URL
export const BASE_API_URL = environment.API_URL;

// MBA Application endpoints
export const MBA_API = {
  ADD: `${BASE_API_URL}/MBAForm/Add`,
  CHECK_PASSPORT: (passportNo: string) =>
    `${BASE_API_URL}/MBAForm/CheckPassport/check-passport/${passportNo}`,
  CHECK_MOBILE: (mobile: string) =>
    `${BASE_API_URL}/MBAForm/CheckMobile/check-mobile/${mobile}`,
  GET_ACTIVE_PROGRAMS: `${BASE_API_URL}/MBAProgram/GetActive`,
  GET_ACTIVE_LANGUAGES: `${BASE_API_URL}/MBALanguage/GetActive`,
  GET_ACTIVE_COUNTRIES: `${BASE_API_URL}/MBACountry/GetActive`,
};
