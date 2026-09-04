"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isApiError } from "@/lib/types/api";
import { isTwoFaRequired } from "@/lib/types/auth";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  recoveryCodeSchema,
  twoFaSchema,
  type RecoveryCodeValues,
  type TwoFaValues,
} from "@/lib/validations/auth";

export default function TwoFaChallengePage() {
  const router = useRouter();
  const loginKey = useAuthStore((state) => state.loginKey);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setLoginKey = useAuthStore((state) => state.setLoginKey);
  const [useRecovery, setUseRecovery] = useState(false);

  const totpForm = useForm<TwoFaValues>({
    resolver: zodResolver(twoFaSchema),
    defaultValues: { two_fa_code: "" },
  });
  const recoveryForm = useForm<RecoveryCodeValues>({
    resolver: zodResolver(recoveryCodeSchema),
    defaultValues: { recovery_code: "" },
  });

  if (!loginKey) {
    return (
      <AuthCard title="Session expired" description="Start signing in again.">
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </AuthCard>
    );
  }

  async function complete(payload: { two_fa_code?: string; recovery_code?: string }) {
    const data = await authApi.verifyTwoFa({ login_key: loginKey ?? undefined, ...payload });
    if (isTwoFaRequired(data)) {
      throw new Error("Two-factor challenge is still pending");
    }
    setAccessToken(data.access_tokens.access_token_string);
    setLoginKey(null);
    toast.success("Welcome back");
    router.replace("/dashboard");
  }

  return (
    <AuthCard
      title="Two-factor authentication"
      description="Confirm it's you with your authenticator app."
    >
      {!useRecovery ? (
        <form
          className="grid gap-4"
          onSubmit={totpForm.handleSubmit(async (values) => {
            try {
              await complete({ two_fa_code: values.two_fa_code });
            } catch (error) {
              applyApiFieldErrors(error, totpForm.setError);
              toast.error(isApiError(error) ? error.message : "Invalid code");
            }
          })}
        >
          <Field label="Authenticator code" error={totpForm.formState.errors.two_fa_code?.message}>
            <OtpInput
              length={6}
              value={totpForm.watch("two_fa_code")}
              onChange={(value) =>
                totpForm.setValue("two_fa_code", value, { shouldValidate: true })
              }
            />
          </Field>
          <Button type="submit" disabled={totpForm.formState.isSubmitting}>
            {totpForm.formState.isSubmitting ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setUseRecovery(true)}
          >
            Use a recovery code instead
          </button>
        </form>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={recoveryForm.handleSubmit(async (values) => {
            try {
              await complete({ recovery_code: values.recovery_code });
            } catch (error) {
              applyApiFieldErrors(error, recoveryForm.setError);
              toast.error(isApiError(error) ? error.message : "Invalid recovery code");
            }
          })}
        >
          <Field
            label="Recovery code"
            htmlFor="recovery_code"
            error={recoveryForm.formState.errors.recovery_code?.message}
          >
            <Input id="recovery_code" autoComplete="off" {...recoveryForm.register("recovery_code")} />
          </Field>
          <Button type="submit" disabled={recoveryForm.formState.isSubmitting}>
            {recoveryForm.formState.isSubmitting ? "Verifying…" : "Verify recovery code"}
          </Button>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setUseRecovery(false)}
          >
            Use authenticator code
          </button>
        </form>
      )}
    </AuthCard>
  );
}
