"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { GuestGuard } from "@/components/layout/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/hooks/use-auth";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import {
  loginPasswordSchema,
  type LoginPasswordValues,
} from "@/lib/validations/auth";

export default function LoginPage() {
  const login = useLogin();
  const form = useForm<LoginPasswordValues>({
    resolver: zodResolver(loginPasswordSchema),
    defaultValues: {
      national_identity_code: "",
      password: "",
    },
  });

  return (
    <GuestGuard>
    <AuthCard
      title="Sign in"
      description="Use your national identity code and password."
      footer={
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await login.mutateAsync(values);
          } catch (error) {
            applyApiFieldErrors(error, form.setError);
          }
        })}
      >
        <Field
          label="National identity code"
          htmlFor="national_identity_code"
          error={form.formState.errors.national_identity_code?.message}
        >
          <Input
            id="national_identity_code"
            inputMode="numeric"
            autoComplete="username"
            {...form.register("national_identity_code")}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <Link href="/login/otp" className="text-primary hover:underline">
            Sign in with OTP
          </Link>
          <Link href="/recover-password" className="text-muted-foreground hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
    </GuestGuard>
  );
}
