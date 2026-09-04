"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { GuestGuard } from "@/components/layout/auth-guard";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isApiError } from "@/lib/types/api";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import { otpSchema, type OtpValues } from "@/lib/validations/auth";

export default function RegisterVerifyPage() {
  const router = useRouter();
  const pendingOtp = useAuthStore((state) => state.pendingOtp);
  const setPendingOtp = useAuthStore((state) => state.setPendingOtp);
  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  if (pendingOtp?.flow !== "register") {
    return (
      <GuestGuard>
      <AuthCard title="Verification expired" description="Start registration again to receive a new code.">
        <Button asChild className="w-full">
          <Link href="/register">Back to register</Link>
        </Button>
      </AuthCard>
      </GuestGuard>
    );
  }

  return (
    <GuestGuard>
    <AuthCard
      title="Verify your mobile"
      description="Enter the 5-digit code we just sent."
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await authApi.registerVerifyOtp({
              register_key: pendingOtp.key,
              otp: values.otp,
            });
            setPendingOtp(null);
            toast.success("Account created. You can sign in now.");
            router.replace("/login");
          } catch (error) {
            applyApiFieldErrors(error, form.setError);
            toast.error(isApiError(error) ? error.message : "Verification failed");
          }
        })}
      >
        <Field label="Verification code" error={form.formState.errors.otp?.message}>
          <OtpInput
            value={form.watch("otp")}
            onChange={(value) => form.setValue("otp", value, { shouldValidate: true })}
          />
        </Field>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Verifying…" : "Verify"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            try {
              await authApi.registerResendOtp({ register_key: pendingOtp.key });
              toast.success("A new code was sent");
            } catch (error) {
              toast.error(isApiError(error) ? error.message : "Could not resend");
            }
          }}
        >
          Resend code
        </Button>
      </form>
    </AuthCard>
    </GuestGuard>
  );
}
