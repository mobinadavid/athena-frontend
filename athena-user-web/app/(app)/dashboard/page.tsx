import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="You're signed in. Payment analytics arrive in Phase 2."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Authentication is live against the Athena API.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Access tokens stay in memory. Refresh uses the httpOnly cookie automatically.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Coming next</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Request addresses, watch deposits, and confirm payments once Phase 2 is wired.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Two-factor and sessions are ready now.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Enable TOTP from Settings → Security, and revoke devices from Sessions.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
