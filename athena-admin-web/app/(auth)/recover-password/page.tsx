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
import { isApiError } from "@/lib/types/api";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  recoverPasswordRequestSchema,
  recoverPasswordSetSchema,
  type RecoverPasswordRequestValues,
  type RecoverPasswordSetValues,
} from "@/lib/validations/auth";

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");

  const requestForm = useForm<RecoverPasswordRequestValues>({
    resolver: zodResolver(recoverPasswordRequestSchema),
    defaultValues: { username: "", mobile: "" },
  });
  const verifyForm = useForm<RecoverPasswordSetValues>({
    resolver: zodResolver(recoverPasswordSetSchema),
    defaultValues: { otp: "", new_password: "", new_password_confirmation: "" },
  });

  return (
    <AuthCard
      title="Reset admin password"
      description={
        step === "request"
          ? "We'll send a code to the mobile on the admin account."
          : "Enter the code and choose a new password."
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
              await authApi.recoverPasswordSendOtp(values);
              setUsername(values.username);
              setStep("verify");
              toast.success("OTP sent");
            } catch (error) {
              applyApiFieldErrors(error, requestForm.setError);
              toast.error(isApiError(error) ? error.message : "Could not send OTP");
            }
          })}
        >
          <Field label="Username" htmlFor="username" error={requestForm.formState.errors.username?.message}>
            <Input id="username" {...requestForm.register("username")} />
          </Field>
          <Field
            label="Mobile"
            htmlFor="mobile"
            hint="Must match the number on the admin account (09XXXXXXXXX)"
            error={requestForm.formState.errors.mobile?.message}
          >
            <Input id="mobile" inputMode="tel" {...requestForm.register("mobile")} />
          </Field>
          <Button type="submit" disabled={requestForm.formState.isSubmitting}>
            {requestForm.formState.isSubmitting ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={verifyForm.handleSubmit(async (values) => {
            try {
              await authApi.recoverPasswordVerifyOtp({
                username,
                otp: values.otp,
                new_password: values.new_password,
                new_password_confirmation: values.new_password_confirmation,
              });
              toast.success("Password updated. Sign in with your new password.");
              router.replace("/login");
            } catch (error) {
              applyApiFieldErrors(error, verifyForm.setError);
              toast.error(isApiError(error) ? error.message : "Could not reset password");
            }
          })}
        >
          <Field label="One-time code" error={verifyForm.formState.errors.otp?.message}>
            <OtpInput
              value={verifyForm.watch("otp")}
              onChange={(value) => verifyForm.setValue("otp", value, { shouldValidate: true })}
            />
          </Field>
          <Field
            label="New password"
            htmlFor="new_password"
            error={verifyForm.formState.errors.new_password?.message}
          >
            <PasswordInput id="new_password" autoComplete="new-password" {...verifyForm.register("new_password")} />
          </Field>
          <Field
            label="Confirm password"
            htmlFor="new_password_confirmation"
            error={verifyForm.formState.errors.new_password_confirmation?.message}
          >
            <PasswordInput
              id="new_password_confirmation"
              autoComplete="new-password"
              {...verifyForm.register("new_password_confirmation")}
            />
          </Field>
          <Button type="submit" disabled={verifyForm.formState.isSubmitting}>
            {verifyForm.formState.isSubmitting ? "Saving…" : "Set new password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
