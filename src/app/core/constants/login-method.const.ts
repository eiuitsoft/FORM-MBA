import { LoginMethodEnum } from '../enums/login-method.enum';

export interface LoginMethod {
  value: LoginMethodEnum;
  name: string;
}

export const LOGIN_METHODS: LoginMethod[] = [
  {
    value: LoginMethodEnum.CODE,
    name: 'Profile Code',
  },
  {
    value: LoginMethodEnum.PHONE_NUMBER,
    name: 'Registered Phone Number',
  },
];
