"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard, Field } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { RecoverPasswordForm } from "@/components/auth/recover-password-form";
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
  const [recover, setRecover] = useState(false);
  const form = useForm<LoginPasswordValues>({
    resolver: zodResolver(loginPasswordSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <GuestGuard>
      <AuthCard
        title={recover ? "Reset admin password" : "Admin sign in"}
        description={
          recover
            ? "We'll send a code to the mobile on the admin account."
            : "Staff access for wallets, users, and payments."
        }
      >
        {recover ? (
          <RecoverPasswordForm onBack={() => setRecover(false)} />
        ) : (
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
              label="Username"
              htmlFor="username"
              error={form.formState.errors.username?.message}
            >
              <Input
                id="username"
                autoComplete="username"
                placeholder="admin.username"
                {...form.register("username")}
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
                placeholder="Your password"
                {...form.register("password")}
              />
            </Field>
            <div className="text-right text-sm">
              <button
                type="button"
                className="text-muted-foreground hover:underline"
                onClick={() => setRecover(true)}
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </AuthCard>
    </GuestGuard>
  );
}
