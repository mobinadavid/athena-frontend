import { apiClient } from "@/lib/api/client";
import type {
  LoginResponse,
  OtpKeyData,
  TwoFaEnableData,
  TwoFaStatusData,
  TwoFaVerifyData,
} from "@/lib/types/auth";
import type { AdminModel } from "@/lib/types/models";

export const authApi = {
  login(payload: { username: string; password: string }) {
    return apiClient.post<LoginResponse>("/authentication/login", payload);
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

  recoverPasswordSendOtp(payload: { username: string; mobile: string }) {
    return apiClient.post<Record<string, never>>(
      "/authentication/recover-password",
      payload,
    );
  },

  recoverPasswordVerifyOtp(payload: {
    username: string;
    otp: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    return apiClient.post<Record<string, never>>(
      "/authentication/recover-password/verify-otp",
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

  getProfile() {
    return apiClient.post<{ admin: AdminModel }>("/admins/get-profile", {});
  },

  changePasswordSendOtp(payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    return apiClient.post<OtpKeyData>("/admins/change-password/send-otp", payload);
  },

  changePasswordVerify(payload: { otp: string; key?: string }) {
    return apiClient.post<Record<string, never>>("/admins/change-password", payload);
  },

  changePasswordResend(payload: { key?: string } = {}) {
    return apiClient.post<OtpKeyData>(
      "/admins/change-password/resend-otp",
      payload,
    );
  },
};
