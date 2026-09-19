"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { errorMessage } from "@/components/query-error";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  recoverPasswordRequestSchema,
  recoverPasswordSetSchema,
  type RecoverPasswordRequestValues,
  type RecoverPasswordSetValues,
} from "@/lib/validations/auth";

export function RecoverPasswordForm({ onBack }: { onBack?: () => void }) {
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

  return step === "request" ? (
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
          toast.error(errorMessage(error, "Could not send OTP"));
        }
      })}
    >
      <p className="text-xs text-muted-foreground">
        The reset cookie is stored in this browser after we send the code. Stay
        on this page until you finish setting a new password.
      </p>
      <Field
        label="Username"
        htmlFor="recover_username"
        error={requestForm.formState.errors.username?.message}
      >
        <Input
          id="recover_username"
          placeholder="admin.username"
          autoComplete="username"
          {...requestForm.register("username")}
        />
      </Field>
      <Field
        label="Mobile"
        htmlFor="recover_mobile"
        hint="Must match the number on the admin account"
        error={requestForm.formState.errors.mobile?.message}
      >
        <Input
          id="recover_mobile"
          inputMode="tel"
          placeholder="0912*******"
          {...requestForm.register("mobile")}
        />
      </Field>
      <Button type="submit" disabled={requestForm.formState.isSubmitting}>
        {requestForm.formState.isSubmitting ? "Sending…" : "Send code"}
      </Button>
      {onBack ? (
        <button type="button" className="text-sm text-primary hover:underline" onClick={onBack}>
          Back to sign in
        </button>
      ) : null}
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
          toast.error(errorMessage(error, "Could not reset password"));
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
        htmlFor="recover_new_password"
        error={verifyForm.formState.errors.new_password?.message}
      >
        <PasswordInput
          id="recover_new_password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...verifyForm.register("new_password")}
        />
      </Field>
      <Field
        label="Confirm password"
        htmlFor="recover_new_password_confirmation"
        error={verifyForm.formState.errors.new_password_confirmation?.message}
      >
        <PasswordInput
          id="recover_new_password_confirmation"
          autoComplete="new-password"
          placeholder="Repeat new password"
          {...verifyForm.register("new_password_confirmation")}
        />
      </Field>
      <Button type="submit" disabled={verifyForm.formState.isSubmitting}>
        {verifyForm.formState.isSubmitting ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
