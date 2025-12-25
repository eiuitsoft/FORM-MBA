import { LoginMethodEnum } from '../enums/login-method.enum';

export interface LoginMethod {
  value: LoginMethodEnum;
  name: string;
}

export const LOGIN_METHODS: LoginMethod[] = [
  {
    value: LoginMethodEnum.CODE,
    name: 'Mã hồ sơ',
  },
  {
    value: LoginMethodEnum.PHONE_NUMBER,
    name: 'Số điện thoại đã đăng ký',
  },
];
