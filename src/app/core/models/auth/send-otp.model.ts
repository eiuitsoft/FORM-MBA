import { LoginMethodEnum } from '../../enums/login-method.enum';

export interface SendOTP {
  value: string;
  method: LoginMethodEnum;
  sendType: string; // 'SMS' | 'EMAIL' | 'ZALO'
}
