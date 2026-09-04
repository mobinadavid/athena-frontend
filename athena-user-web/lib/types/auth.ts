export interface JwtDTO {
  access_token_string: string;
  refresh_token_string: string;
  refresh_token_expires_at: string;
  access_token_expires_at: string;
}

export interface LoginTokensData {
  access_tokens: JwtDTO;
}

export interface TwoFaRequiredData {
  two_fa_required: true;
  login_key: string;
}

export type LoginResponse = LoginTokensData | TwoFaRequiredData;

export interface OtpKeyData {
  key: string;
  "time-out"?: number;
}

export interface TwoFaStatusData {
  two_fa_enabled: boolean;
}

export interface TwoFaEnableData {
  secret_url: string;
  secret_key: string;
  qr_code: string;
}

export interface TwoFaVerifyData {
  recovery_codes: string[];
}

export function isTwoFaRequired(
  data: LoginResponse,
): data is TwoFaRequiredData {
  return "two_fa_required" in data && data.two_fa_required === true;
}
