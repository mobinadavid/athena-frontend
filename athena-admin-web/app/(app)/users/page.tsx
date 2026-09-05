"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/auth/auth-card";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateUser, useUsers } from "@/lib/hooks/use-admin-data";
import { formatDate } from "@/lib/utils/format";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const users = useUsers({ page, page_size: 10, global_search: search || undefined });
  const create = useCreateUser();

  return (
    <div>
      <PageHeader
        title="Users"
        description="End-user accounts on the platform."
        actions={<Button onClick={() => setOpen(true)}>Create User</Button>}
      />
      <Card>
        <CardContent className="pt-4">
          <Input
            className="mb-4 max-w-xs"
            placeholder="Search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          {users.isLoading ? <Skeleton className="h-12 w-full" /> : null}
          {users.isError ? <QueryError error={users.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Mobile</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(users.data?.items ?? []).map((user) => (
                  <tr key={user.uuid} className="hover:bg-muted/40">
                    <td className="px-2 py-3">
                      <Link href={`/users/${user.uuid}`} className="font-medium hover:underline">
                        {user.full_name || `${user.first_name} ${user.last_name}`.trim() || "User"}
                      </Link>
                    </td>
                    <td className="px-2 py-3">{user.mobile}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={user.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} totalPages={users.data?.total_pages ?? 1} onPageChange={setPage} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              await create.mutateAsync({
                mobile: String(form.get("mobile")),
                national_identity_code: String(form.get("national_identity_code") || "") || undefined,
                password: String(form.get("password")),
                password_confirmation: String(form.get("password_confirmation")),
              });
              setOpen(false);
            }}
          >
            <Field label="Mobile">
              <Input name="mobile" required />
            </Field>
            <Field label="National identity code">
              <Input name="national_identity_code" />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" required />
            </Field>
            <Field label="Confirm password">
              <Input name="password_confirmation" type="password" required />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={create.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
