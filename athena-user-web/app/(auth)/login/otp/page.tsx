"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { GuestGuard } from "@/components/layout/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isApiError } from "@/lib/types/api";
import { isTwoFaRequired } from "@/lib/types/auth";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  loginOtpSendSchema,
  otpSchema,
  type LoginOtpSendValues,
  type OtpValues,
} from "@/lib/validations/auth";

export default function LoginOtpPage() {
  const router = useRouter();
  const pendingOtp = useAuthStore((state) => state.pendingOtp);
  const setPendingOtp = useAuthStore((state) => state.setPendingOtp);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setLoginKey = useAuthStore((state) => state.setLoginKey);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendForm = useForm<LoginOtpSendValues>({
    resolver: zodResolver(loginOtpSendSchema),
    defaultValues: { national_identity_code: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const inVerifyStep = pendingOtp?.flow === "login-otp";

  return (
    <GuestGuard>
    <AuthCard
      title={inVerifyStep ? "Enter login code" : "Sign in with OTP"}
      description={
        inVerifyStep
          ? "We sent a 5-digit code to your registered mobile."
          : "We'll send a one-time code to the mobile on your account."
      }
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Use password instead
        </Link>
      }
    >
      {!inVerifyStep ? (
        <form
          className="grid gap-4"
          onSubmit={sendForm.handleSubmit(async (values) => {
            setSending(true);
            try {
              const data = await authApi.loginViaOtpSend(values);
              setPendingOtp({
                flow: "login-otp",
                key: data.key,
                timeoutSeconds: data["time-out"],
              });
              toast.success("OTP sent");
            } catch (error) {
              applyApiFieldErrors(error, sendForm.setError);
              toast.error(isApiError(error) ? error.message : "Could not send OTP");
            } finally {
              setSending(false);
            }
          })}
        >
          <Field
            label="National identity code"
            htmlFor="national_identity_code"
            error={sendForm.formState.errors.national_identity_code?.message}
          >
            <Input
              id="national_identity_code"
              inputMode="numeric"
              {...sendForm.register("national_identity_code")}
            />
          </Field>
          <Button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={otpForm.handleSubmit(async (values) => {
            setVerifying(true);
            try {
              const data = await authApi.loginViaOtpVerify({
                login_key: pendingOtp.key,
                otp: values.otp,
              });
              if (isTwoFaRequired(data)) {
                setLoginKey(data.login_key);
                setPendingOtp(null);
                toast.message("Two-factor authentication required");
                router.push("/two-fa");
                return;
              }
              setAccessToken(data.access_tokens.access_token_string);
              setPendingOtp(null);
              toast.success("Welcome back");
              router.replace("/dashboard");
            } catch (error) {
              applyApiFieldErrors(error, otpForm.setError);
              toast.error(isApiError(error) ? error.message : "Invalid code");
            } finally {
              setVerifying(false);
            }
          })}
        >
          <Field label="One-time code" error={otpForm.formState.errors.otp?.message}>
            <OtpInput
              value={otpForm.watch("otp")}
              onChange={(value) => otpForm.setValue("otp", value, { shouldValidate: true })}
              disabled={verifying}
            />
          </Field>
          <Button type="submit" disabled={verifying}>
            {verifying ? "Verifying…" : "Verify"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              try {
                await authApi.loginViaOtpResend({ login_key: pendingOtp.key });
                toast.success("A new code was sent");
              } catch (error) {
                toast.error(isApiError(error) ? error.message : "Could not resend");
              }
            }}
          >
            Resend code
          </Button>
        </form>
      )}
    </AuthCard>
    </GuestGuard>
  );
}
