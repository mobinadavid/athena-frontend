"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isApiError } from "@/lib/types/api";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  otpSchema,
  recoverPasswordRequestSchema,
  setPasswordSchema,
  type OtpValues,
  type RecoverPasswordRequestValues,
  type SetPasswordValues,
} from "@/lib/validations/auth";

type Step = "request" | "otp" | "password";

export default function RecoverPasswordPage() {
  const router = useRouter();
  const pendingOtp = useAuthStore((state) => state.pendingOtp);
  const setPendingOtp = useAuthStore((state) => state.setPendingOtp);
  const [step, setStep] = useState<Step>(
    pendingOtp?.flow === "recover" ? "otp" : "request",
  );

  const requestForm = useForm<RecoverPasswordRequestValues>({
    resolver: zodResolver(recoverPasswordRequestSchema),
    defaultValues: { national_identity_code: "", mobile: "" },
  });
  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const passwordForm = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", re_password: "" },
  });

  return (
    <AuthCard
      title="Reset password"
      description={
        step === "request"
          ? "We'll send a code to the mobile on your account."
          : step === "otp"
            ? "Enter the 5-digit code we sent."
            : "Choose a new password."
      }
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {step === "request" ? (
        <form
          className="grid gap-4"
          onSubmit={requestForm.handleSubmit(async (values) => {
            try {
              const data = await authApi.recoverPasswordSendOtp(values);
              setPendingOtp({
                flow: "recover",
                key: data.key,
                timeoutSeconds: data["time-out"],
              });
              setStep("otp");
              toast.success("OTP sent");
            } catch (error) {
              applyApiFieldErrors(error, requestForm.setError);
              toast.error(isApiError(error) ? error.message : "Could not send OTP");
            }
          })}
        >
          <Field
            label="National identity code"
            htmlFor="national_identity_code"
            error={requestForm.formState.errors.national_identity_code?.message}
          >
            <Input id="national_identity_code" inputMode="numeric" {...requestForm.register("national_identity_code")} />
          </Field>
          <Field label="Mobile" htmlFor="mobile" error={requestForm.formState.errors.mobile?.message}>
            <Input id="mobile" inputMode="tel" {...requestForm.register("mobile")} />
          </Field>
          <Button type="submit" disabled={requestForm.formState.isSubmitting}>
            {requestForm.formState.isSubmitting ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : null}

      {step === "otp" && pendingOtp?.flow === "recover" ? (
        <form
          className="grid gap-4"
          onSubmit={otpForm.handleSubmit(async (values) => {
            try {
              const data = await authApi.recoverPasswordVerifyOtp({
                recover_password_key: pendingOtp.key,
                otp: values.otp,
              });
              setPendingOtp({
                flow: "recover",
                key: data.key || pendingOtp.key,
              });
              setStep("password");
              toast.success("Code verified");
            } catch (error) {
              applyApiFieldErrors(error, otpForm.setError);
              toast.error(isApiError(error) ? error.message : "Invalid code");
            }
          })}
        >
          <Field label="One-time code" error={otpForm.formState.errors.otp?.message}>
            <OtpInput
              value={otpForm.watch("otp")}
              onChange={(value) => otpForm.setValue("otp", value, { shouldValidate: true })}
            />
          </Field>
          <Button type="submit" disabled={otpForm.formState.isSubmitting}>
            {otpForm.formState.isSubmitting ? "Verifying…" : "Verify"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              try {
                await authApi.recoverPasswordResendOtp({
                  recover_password_key: pendingOtp.key,
                });
                toast.success("A new code was sent");
              } catch (error) {
                toast.error(isApiError(error) ? error.message : "Could not resend");
              }
            }}
          >
            Resend code
          </Button>
        </form>
      ) : null}

      {step === "password" && pendingOtp?.flow === "recover" ? (
        <form
          className="grid gap-4"
          onSubmit={passwordForm.handleSubmit(async (values) => {
            try {
              await authApi.recoverPasswordSet({
                recover_password_key: pendingOtp.key,
                password: values.password,
                re_password: values.re_password,
              });
              setPendingOtp(null);
              toast.success("Password updated. Sign in with your new password.");
              router.replace("/login");
            } catch (error) {
              applyApiFieldErrors(error, passwordForm.setError);
              toast.error(isApiError(error) ? error.message : "Could not set password");
            }
          })}
        >
          <Field
            label="New password"
            htmlFor="password"
            error={passwordForm.formState.errors.password?.message}
          >
            <PasswordInput id="password" autoComplete="new-password" {...passwordForm.register("password")} />
          </Field>
          <Field
            label="Confirm password"
            htmlFor="re_password"
            error={passwordForm.formState.errors.re_password?.message}
          >
            <PasswordInput id="re_password" autoComplete="new-password" {...passwordForm.register("re_password")} />
          </Field>
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Saving…" : "Set new password"}
          </Button>
        </form>
      ) : null}
    </AuthCard>
  );
}
