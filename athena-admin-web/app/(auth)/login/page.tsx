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
      username: "",
      password: "",
    },
  });

  return (
    <GuestGuard>
      <AuthCard
        title="Admin sign in"
        description="Staff access for wallets, users, and payments."
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
            label="Username"
            htmlFor="username"
            error={form.formState.errors.username?.message}
          >
            <Input id="username" autoComplete="username" {...form.register("username")} />
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
          <div className="text-right text-sm">
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
