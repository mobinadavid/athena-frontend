import { z } from "zod";
import {
  isStrongPassword,
  isValidIranianMobile,
  isValidNationalIdentityCode,
} from "@/lib/validations/iran";

const nationalIdentityCode = z
  .string()
  .min(1, "National identity code is required")
  .refine(isValidNationalIdentityCode, "Enter a valid national identity code");

const mobile = z
  .string()
  .min(1, "Mobile number is required")
  .refine(isValidIranianMobile, "Enter a valid Iranian mobile (09XXXXXXXXX)");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    isStrongPassword,
    "Use upper and lowercase letters, a number, and a special character",
  );

const otp = z
  .string()
  .length(5, "Enter the 5-digit code");

export const loginPasswordSchema = z.object({
  national_identity_code: nationalIdentityCode,
  password: z.string().min(1, "Password is required"),
});

export const loginOtpSendSchema = z.object({
  national_identity_code: nationalIdentityCode,
});

export const otpSchema = z.object({
  otp,
});

export const twoFaSchema = z.object({
  two_fa_code: z.string().min(6, "Enter the 6-digit authenticator code"),
});

export const recoveryCodeSchema = z.object({
  recovery_code: z.string().min(1, "Enter a recovery code"),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required").max(255),
    last_name: z.string().min(1, "Last name is required").max(255),
    national_identity_code: nationalIdentityCode,
    mobile,
    password,
    re_password: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.re_password, {
    message: "Passwords do not match",
    path: ["re_password"],
  });

export const recoverPasswordRequestSchema = z.object({
  national_identity_code: nationalIdentityCode,
  mobile,
});

export const setPasswordSchema = z
  .object({
    password,
    re_password: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.re_password, {
    message: "Passwords do not match",
    path: ["re_password"],
  });

export const totpSchema = z.object({
  totp: z.string().min(6, "Enter the 6-digit authenticator code"),
});

export const disableTwoFaSchema = z
  .object({
    totp: z.string().optional(),
    recovery_code: z.string().optional(),
  })
  .refine((data) => Boolean(data.totp) || Boolean(data.recovery_code), {
    message: "Enter an authenticator code or a recovery code",
    path: ["totp"],
  });

export type LoginPasswordValues = z.infer<typeof loginPasswordSchema>;
export type LoginOtpSendValues = z.infer<typeof loginOtpSendSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type TwoFaValues = z.infer<typeof twoFaSchema>;
export type RecoveryCodeValues = z.infer<typeof recoveryCodeSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type RecoverPasswordRequestValues = z.infer<
  typeof recoverPasswordRequestSchema
>;
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
export type TotpValues = z.infer<typeof totpSchema>;
export type DisableTwoFaValues = z.infer<typeof disableTwoFaSchema>;
