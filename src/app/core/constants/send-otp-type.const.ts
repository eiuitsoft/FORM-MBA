export const SEND_OTP_TYPE = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  ZALO: 'ZALO',
} as const;

export interface SendOtpType {
  value: string;
  name: string;
  message: string;
  nameKey: string;
  messageKey: string;
}

export const SEND_OTP_TYPE_MAP: Record<string, SendOtpType> = {
  [SEND_OTP_TYPE.SMS]: {
    value: SEND_OTP_TYPE.SMS,
    name: 'Receive OTP code via SMS',
    message: 'Please check your phone messages for the OTP code!',
    nameKey: 'LOGIN.OTP_VIA_SMS',
    messageKey: 'LOGIN.OTP_SMS_NOTE'
  },
  [SEND_OTP_TYPE.EMAIL]: {
    value: SEND_OTP_TYPE.EMAIL,
    name: 'Receive OTP code via Email',
    message: 'Please check your Email inbox or spam folder for the OTP code!',
    nameKey: 'LOGIN.OTP_VIA_EMAIL',
    messageKey: 'LOGIN.OTP_EMAIL_NOTE'
  },
  [SEND_OTP_TYPE.ZALO]: {
    value: SEND_OTP_TYPE.ZALO,
    name: 'Receive OTP code via Zalo',
    message: 'Please check your Zalo messages for the OTP code!',
    nameKey: 'LOGIN.OTP_VIA_ZALO',
    messageKey: 'LOGIN.OTP_ZALO_NOTE'
  }
};

export const SEND_OTP_TYPE_LIST = Object.values(SEND_OTP_TYPE_MAP);
