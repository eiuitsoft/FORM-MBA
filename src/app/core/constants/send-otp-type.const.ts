export const SEND_OTP_TYPE = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  ZALO: 'ZALO',
} as const;

export interface SendOtpType {
  value: string;
  name: string;
  message: string;
}

export const SEND_OTP_TYPE_MAP: Record<string, SendOtpType> = {
  [SEND_OTP_TYPE.SMS]: {
    value: SEND_OTP_TYPE.SMS,
    name: 'Receive OTP code via SMS',
    message: 'Please check your phone messages for the OTP code!'
  },
  [SEND_OTP_TYPE.EMAIL]: {
    value: SEND_OTP_TYPE.EMAIL,
    name: 'Receive OTP code via Email',
    message: 'Please check your Email inbox or spam folder for the OTP code!'
  },
  [SEND_OTP_TYPE.ZALO]: {
    value: SEND_OTP_TYPE.ZALO,
    name: 'Receive OTP code via Zalo',
    message: 'Please check your Zalo messages for the OTP code!'
  }
};

export const SEND_OTP_TYPE_LIST = Object.values(SEND_OTP_TYPE_MAP);
