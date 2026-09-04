"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { GuestGuard } from "@/components/layout/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isApiError } from "@/lib/types/api";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setPendingOtp = useAuthStore((state) => state.setPendingOtp);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      national_identity_code: "",
      mobile: "",
      password: "",
      re_password: "",
    },
  });

  return (
    <GuestGuard>
    <AuthCard
      title="Create your account"
      description="We'll send a 5-digit code to your mobile to confirm."
      footer={
        <p className="text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const data = await authApi.registerSendOtp(values);
            setPendingOtp({
              flow: "register",
              key: data.key,
              timeoutSeconds: data["time-out"],
            });
            toast.success("Verification code sent");
            router.push("/register/verify");
          } catch (error) {
            applyApiFieldErrors(error, form.setError);
            toast.error(isApiError(error) ? error.message : "Registration failed");
          }
        })}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="first_name" error={form.formState.errors.first_name?.message}>
            <Input id="first_name" autoComplete="given-name" {...form.register("first_name")} />
          </Field>
          <Field label="Last name" htmlFor="last_name" error={form.formState.errors.last_name?.message}>
            <Input id="last_name" autoComplete="family-name" {...form.register("last_name")} />
          </Field>
        </div>
        <Field
          label="National identity code"
          htmlFor="national_identity_code"
          error={form.formState.errors.national_identity_code?.message}
        >
          <Input id="national_identity_code" inputMode="numeric" {...form.register("national_identity_code")} />
        </Field>
        <Field
          label="Mobile"
          htmlFor="mobile"
          hint="Iranian mobile, e.g. 09123456789"
          error={form.formState.errors.mobile?.message}
        >
          <Input id="mobile" inputMode="tel" autoComplete="tel" {...form.register("mobile")} />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint="8+ characters with upper, lower, number, and symbol"
          error={form.formState.errors.password?.message}
        >
          <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
        </Field>
        <Field
          label="Confirm password"
          htmlFor="re_password"
          error={form.formState.errors.re_password?.message}
        >
          <PasswordInput id="re_password" autoComplete="new-password" {...form.register("re_password")} />
        </Field>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending code…" : "Continue"}
        </Button>
      </form>
    </AuthCard>
    </GuestGuard>
  );
}
