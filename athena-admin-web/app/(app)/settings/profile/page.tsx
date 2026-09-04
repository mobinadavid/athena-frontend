"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProfile } from "@/lib/hooks/use-auth";

export default function ProfilePage() {
  const profile = useAdminProfile();
  const admin = profile.data;

  return (
    <div>
      <PageHeader title="Profile" description="Your admin identity on Athena." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Loaded from POST /admins/get-profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
          ) : null}
          {profile.isError ? (
            <p className="text-sm text-destructive">
              Could not load profile. Your role may be missing the admin-show permission.
            </p>
          ) : null}
          {admin ? (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">
                  {admin.first_name} {admin.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Username</dt>
                <dd className="font-medium">{admin.username}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="font-medium">{admin.mobile}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{admin.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Roles</dt>
                <dd className="font-medium">
                  {admin.roles?.map((role) => role.title || role.name).join(", ") || "—"}
                </dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
