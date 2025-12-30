import { LoginMethodEnum } from '../enums/login-method.enum';

export interface LoginMethod {
  value: LoginMethodEnum;
  name: string;
  translationKey: string;
}

export const LOGIN_METHODS: LoginMethod[] = [
  {
    value: LoginMethodEnum.CODE,
    name: 'Profile Code',
    translationKey: 'LOGIN.PROFILE_CODE',
  },
  {
    value: LoginMethodEnum.PHONE_NUMBER,
    name: 'Registered Phone Number',
    translationKey: 'LOGIN.PHONE_NUMBER',
  },
];
