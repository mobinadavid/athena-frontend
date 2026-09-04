import { apiClient } from "@/lib/api/client";
import type {
  LoginResponse,
  OtpKeyData,
  TwoFaEnableData,
  TwoFaStatusData,
  TwoFaVerifyData,
} from "@/lib/types/auth";

export const authApi = {
  login(payload: {
    national_identity_code?: string;
    username?: string;
    password: string;
  }) {
    return apiClient.post<LoginResponse>("/authentication/login", payload);
  },

  loginViaOtpSend(payload: { national_identity_code: string }) {
    return apiClient.post<OtpKeyData>(
      "/authentication/login/via-otp/send-otp",
      payload,
    );
  },

  loginViaOtpResend(payload: { login_key?: string } = {}) {
    return apiClient.post<OtpKeyData>(
      "/authentication/login/via-otp/resend-otp",
      payload,
    );
  },

  loginViaOtpVerify(payload: { login_key?: string; otp: string }) {
    return apiClient.post<LoginResponse>(
      "/authentication/login/via-otp/verify-otp",
      payload,
    );
  },

  verifyTwoFa(payload: {
    login_key?: string;
    two_fa_code?: string;
    recovery_code?: string;
  }) {
    return apiClient.post<LoginResponse>(
      "/authentication/login/verify-2fa",
      payload,
    );
  },

  registerSendOtp(payload: {
    national_identity_code: string;
    mobile: string;
    first_name: string;
    last_name: string;
    password: string;
    re_password: string;
  }) {
    return apiClient.post<OtpKeyData>(
      "/authentication/register/send-otp",
      payload,
    );
  },

  registerVerifyOtp(payload: { register_key?: string; otp: string }) {
    return apiClient.post<Record<string, never>>(
      "/authentication/register/verify-otp",
      payload,
    );
  },

  registerResendOtp(payload: { register_key?: string } = {}) {
    return apiClient.post<OtpKeyData>(
      "/authentication/register/resend-otp",
      payload,
    );
  },

  recoverPasswordSendOtp(payload: {
    national_identity_code: string;
    mobile: string;
  }) {
    return apiClient.post<OtpKeyData>(
      "/authentication/recover-password",
      payload,
    );
  },

  recoverPasswordVerifyOtp(payload: {
    recover_password_key?: string;
    otp: string;
  }) {
    return apiClient.post<OtpKeyData>(
      "/authentication/recover-password/verify-otp",
      payload,
    );
  },

  recoverPasswordSet(payload: {
    recover_password_key?: string;
    password: string;
    re_password: string;
  }) {
    return apiClient.post<Record<string, never>>(
      "/authentication/recover-password/set-password",
      payload,
    );
  },

  recoverPasswordResendOtp(payload: { recover_password_key?: string } = {}) {
    return apiClient.post<OtpKeyData>(
      "/authentication/recover-password/resend-otp",
      payload,
    );
  },

  twoFaStatus() {
    return apiClient.get<TwoFaStatusData>("/profile/2fa/status");
  },

  twoFaEnable() {
    return apiClient.post<TwoFaEnableData>("/profile/2fa/enable");
  },

  twoFaEnableVerify(payload: { totp: string }) {
    return apiClient.post<TwoFaVerifyData>("/profile/2fa/enable/verify", payload);
  },

  twoFaDisable(payload: { totp?: string; recovery_code?: string }) {
    return apiClient.post<Record<string, never>>("/profile/2fa/disable", payload);
  },
};
