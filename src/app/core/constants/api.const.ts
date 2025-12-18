import { environment } from '../../../environments/environment';

// Base API URL
export const BASE_API_URL = environment.API_URL;

// MBA Application endpoints
export const MBA_API = {
  ADD: `${BASE_API_URL}/MBAForm/Add`,
  CHECK_PASSPORT: (passportNo: string) =>
    `${BASE_API_URL}/MBAForm/CheckPassport/${passportNo}`,
  CHECK_MOBILE: (mobile: string) =>
    `${BASE_API_URL}/MBAForm/CheckMobile/${mobile}`,
};
