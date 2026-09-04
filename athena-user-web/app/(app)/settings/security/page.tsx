"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { OtpInput } from "@/components/auth/otp-input";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useTwoFaStatus } from "@/lib/hooks/use-auth";
import { isApiError } from "@/lib/types/api";
import type { TwoFaEnableData } from "@/lib/types/auth";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  disableTwoFaSchema,
  totpSchema,
  type DisableTwoFaValues,
  type TotpValues,
} from "@/lib/validations/auth";

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const status = useTwoFaStatus();
  const [setup, setSetup] = useState<TwoFaEnableData | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const enable = useMutation({
    mutationFn: authApi.twoFaEnable,
    onSuccess: (data) => {
      setSetup(data);
      setRecoveryCodes(null);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : "Could not start 2FA setup");
    },
  });

  const verify = useForm<TotpValues>({
    resolver: zodResolver(totpSchema),
    defaultValues: { totp: "" },
  });

  const disable = useForm<DisableTwoFaValues>({
    resolver: zodResolver(disableTwoFaSchema),
    defaultValues: { totp: "", recovery_code: "" },
  });

  const enabled = status.data?.two_fa_enabled ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Password recovery and authenticator-based two-factor authentication."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            There is no authenticated change-password endpoint on the user API. Use
            the recovery flow to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/recover-password">Reset password</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            {enabled
              ? "Authenticator app protection is on for this account."
              : "Add an authenticator app to require a code at sign-in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {status.isLoading ? <p className="text-sm text-muted-foreground">Checking status…</p> : null}

          {!enabled && !setup ? (
            <Button onClick={() => enable.mutate()} disabled={enable.isPending}>
              {enable.isPending ? "Generating secret…" : "Enable two-factor"}
            </Button>
          ) : null}

          {setup ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code in your authenticator app, or enter the secret
                manually.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${setup.qr_code}`}
                alt="Two-factor QR code"
                className="size-48 rounded-lg border bg-white p-2"
              />
              <div className="rounded-lg bg-muted px-3 py-2 font-mono text-sm break-all">
                {setup.secret_key}
              </div>
              <form
                className="grid gap-3"
                onSubmit={verify.handleSubmit(async (values) => {
                  try {
                    const data = await authApi.twoFaEnableVerify(values);
                    setRecoveryCodes(data.recovery_codes);
                    setSetup(null);
                    await queryClient.invalidateQueries({ queryKey: ["profile", "2fa", "status"] });
                    toast.success("Two-factor authentication is enabled");
                  } catch (error) {
                    applyApiFieldErrors(error, verify.setError);
                    toast.error(isApiError(error) ? error.message : "Invalid code");
                  }
                })}
              >
                <OtpInput
                  length={6}
                  value={verify.watch("totp")}
                  onChange={(value) => verify.setValue("totp", value, { shouldValidate: true })}
                />
                {verify.formState.errors.totp ? (
                  <p className="text-xs text-destructive">{verify.formState.errors.totp.message}</p>
                ) : null}
                <Button type="submit" disabled={verify.formState.isSubmitting}>
                  Confirm authenticator
                </Button>
              </form>
            </div>
          ) : null}

          {recoveryCodes ? (
            <Alert>
              <AlertTitle>Save these recovery codes now</AlertTitle>
              <AlertDescription>
                They will not be shown again. Each code can disable 2FA if you lose
                your authenticator.
                <ul className="mt-3 grid gap-1 font-mono text-foreground">
                  {recoveryCodes.map((code) => (
                    <li key={code}>{code}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}

          {enabled ? (
            <form
              className="grid max-w-sm gap-3"
              onSubmit={disable.handleSubmit(async (values) => {
                try {
                  await authApi.twoFaDisable({
                    totp: values.totp || undefined,
                    recovery_code: values.recovery_code || undefined,
                  });
                  await queryClient.invalidateQueries({ queryKey: ["profile", "2fa", "status"] });
                  toast.success("Two-factor authentication disabled");
                  disable.reset();
                } catch (error) {
                  applyApiFieldErrors(error, disable.setError);
                  toast.error(isApiError(error) ? error.message : "Could not disable 2FA");
                }
              })}
            >
              <Input placeholder="Authenticator code" {...disable.register("totp")} />
              <Input placeholder="Or recovery code" {...disable.register("recovery_code")} />
              {disable.formState.errors.totp ? (
                <p className="text-xs text-destructive">{disable.formState.errors.totp.message}</p>
              ) : null}
              <Button type="submit" variant="destructive" disabled={disable.formState.isSubmitting}>
                Disable two-factor
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
