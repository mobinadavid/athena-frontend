import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your identity is tied to the signed-in session."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            The user API does not currently expose a self-profile endpoint. Name and
            contact fields will be editable here in Phase 2 if the backend adds one.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use Security to manage two-factor authentication, and Sessions to review
          devices that hold an access token.
        </CardContent>
      </Card>
    </div>
  );
}
