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
    name: 'Nhận mã OTP qua tin nhắn SMS',
    message: 'Vui lòng kiểm tra tin nhắn điện thoại để xem mã OTP!'
  },
  [SEND_OTP_TYPE.EMAIL]: {
    value: SEND_OTP_TYPE.EMAIL,
    name: 'Nhận mã OTP qua Email',
    message: 'Vui lòng kiểm tra Email, thư mục "Hộp thư đến" hoặc "Thư rác" để xem mã OTP!'
  },
  [SEND_OTP_TYPE.ZALO]: {
    value: SEND_OTP_TYPE.ZALO,
    name: 'Nhận mã OTP qua Zalo',
    message: 'Vui lòng kiểm tra tin nhắn Zalo để xem mã OTP!'
  }
};

export const SEND_OTP_TYPE_LIST = Object.values(SEND_OTP_TYPE_MAP);
