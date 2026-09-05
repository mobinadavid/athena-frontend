"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/lib/hooks/use-admin-data";
import { formatDate } from "@/lib/utils/format";

export default function UserDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const profile = useUserProfile(uuid);
  const user = profile.data;

  return (
    <div>
      <PageHeader
        title="User profile"
        actions={
          <Button variant="outline" asChild>
            <Link href="/users">Back</Link>
          </Button>
        }
      />
      {profile.isLoading ? <Skeleton className="h-40" /> : null}
      {profile.isError ? <QueryError error={profile.error} /> : null}
      {user ? (
        <Card className="max-w-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>
                {user.full_name || `${user.first_name} ${user.last_name}`.trim() || "User"}
              </CardTitle>
              <StatusBadge status={user.is_active ? "active" : "inactive"} />
            </div>
            <CardDescription>Created {formatDate(user.created_at)}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Mobile</p>
              <p className="font-medium">{user.mobile}</p>
            </div>
            <div>
              <p className="text-muted-foreground">National ID</p>
              <p className="font-medium">{user.national_identity_code || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email || "—"}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/payments?global_search=${user.uuid}`}>View payments</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
