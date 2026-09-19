"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RecoverPasswordForm } from "@/components/auth/recover-password-form";

export default function RecoverPasswordPage() {
  return (
    <AuthCard
      title="Reset admin password"
      description="We'll send a code to the mobile on the admin account."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <RecoverPasswordForm />
    </AuthCard>
  );
}
