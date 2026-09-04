import { z } from "zod";
import { isStrongPassword, isValidIranianMobile } from "@/lib/validations/iran";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    isStrongPassword,
    "Use upper and lowercase letters, a number, and a special character",
  );

export const loginPasswordSchema = z.object({
  username: z.string().min(1, "Username is required").max(255),
  password: z.string().min(1, "Password is required"),
});

export const twoFaSchema = z.object({
  two_fa_code: z.string().min(6, "Enter the 6-digit authenticator code"),
});

export const recoveryCodeSchema = z.object({
  recovery_code: z.string().min(1, "Enter a recovery code"),
});

export const recoverPasswordRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .refine(isValidIranianMobile, "Enter a valid Iranian mobile (09XXXXXXXXX)"),
});

export const recoverPasswordSetSchema = z
  .object({
    otp: z.string().length(5, "Enter the 5-digit code"),
    new_password: password,
    new_password_confirmation: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords do not match",
    path: ["new_password_confirmation"],
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

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: password,
    new_password_confirmation: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords do not match",
    path: ["new_password_confirmation"],
  });

export const otpSchema = z.object({
  otp: z.string().length(5, "Enter the 5-digit code"),
});

export type LoginPasswordValues = z.infer<typeof loginPasswordSchema>;
export type TwoFaValues = z.infer<typeof twoFaSchema>;
export type RecoveryCodeValues = z.infer<typeof recoveryCodeSchema>;
export type RecoverPasswordRequestValues = z.infer<
  typeof recoverPasswordRequestSchema
>;
export type RecoverPasswordSetValues = z.infer<typeof recoverPasswordSetSchema>;
export type TotpValues = z.infer<typeof totpSchema>;
export type DisableTwoFaValues = z.infer<typeof disableTwoFaSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
