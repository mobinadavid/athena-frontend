"use client";

import { useState } from "react";
import { Field } from "@/components/auth/auth-card";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
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
import {
  useAdmins,
  useCreateAdmin,
  useDeleteAdmin,
  useRoleOptions,
  useUpdateAdmin,
} from "@/lib/hooks/use-admin-data";
import type { AdminUser } from "@/lib/types/models";
import { formatDate } from "@/lib/utils/format";

export default function AdminsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [ipOpen, setIpOpen] = useState(false);
  const admins = useAdmins({ page, page_size: 10, global_search: search || undefined });
  const roles = useRoleOptions();
  const create = useCreateAdmin();
  const update = useUpdateAdmin();
  const remove = useDeleteAdmin();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedRoles = (roles.data ?? [])
      .filter((role) => form.get(`role_${role.uuid}`) === "on")
      .map((role) => role.uuid);
    const ips = String(form.get("allowed_ips") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (editing) {
      await update.mutateAsync({
        uuid: editing.uuid,
        payload: {
          first_name: String(form.get("first_name")),
          last_name: String(form.get("last_name")),
          mobile: String(form.get("mobile")),
          username: String(form.get("username")),
          password: String(form.get("password") || "") || undefined,
          roles: selectedRoles,
          description: String(form.get("description") || "") || undefined,
          all_ips_allowed: form.get("all_ips_allowed") === "on",
          allowed_ips: ips,
          is_active: form.get("is_active") === "on",
        },
      });
    } else {
      await create.mutateAsync({
        first_name: String(form.get("first_name")),
        last_name: String(form.get("last_name")),
        mobile: String(form.get("mobile")),
        username: String(form.get("username")),
        password: String(form.get("password")),
        roles: selectedRoles,
        is_active: form.get("is_active") === "on",
      });
    }
    setOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Staff accounts and their roles."
        actions={<Button onClick={() => setOpen(true)}>Create admin</Button>}
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
          {admins.isLoading ? <Skeleton className="h-12 w-full" /> : null}
          {admins.isError ? <QueryError error={admins.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Admin</th>
                  <th className="px-2 py-2 font-medium">Roles</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {(admins.data?.items ?? []).map((admin) => (
                  <tr key={admin.uuid}>
                    <td className="px-2 py-3">
                      <p className="font-medium">
                        {admin.first_name} {admin.last_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{admin.username}</p>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(admin.roles ?? []).map((role) => (
                          <Badge key={role.uuid} variant="secondary">
                            {role.title || role.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <StatusBadge status={admin.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button size="xs" variant="outline" onClick={() => setEditing(admin)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this admin?")) remove.mutate(admin.uuid);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} totalPages={admins.data?.total_pages ?? 1} onPageChange={setPage} />
        </CardContent>
      </Card>

      <Dialog
        open={open || Boolean(editing)}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit admin" : "Create admin"}</DialogTitle>
          </DialogHeader>
          <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={submit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name">
                <Input name="first_name" defaultValue={editing?.first_name} placeholder="Sara" required />
              </Field>
              <Field label="Last name">
                <Input name="last_name" defaultValue={editing?.last_name} placeholder="Karimi" required />
              </Field>
            </div>
            <Field label="Username">
              <Input name="username" defaultValue={editing?.username} placeholder="admin.sara" required />
            </Field>
            <Field label="Mobile">
              <Input name="mobile" defaultValue={editing?.mobile} placeholder="0912*******" required />
            </Field>
            <Field label={editing ? "Password (leave blank to keep)" : "Password"}>
              <Input name="password" type="password" placeholder="At least 8 characters" required={!editing} />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium">Roles</p>
              <div className="grid gap-2">
                {(roles.data ?? []).map((role) => (
                  <label key={role.uuid} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`role_${role.uuid}`}
                      defaultChecked={Boolean(editing?.roles?.some((item) => item.uuid === role.uuid))}
                    />
                    {role.title || role.name}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
              Active
            </label>
            {editing ? (
              <div className="rounded-lg border p-3">
                <button type="button" className="text-sm font-medium" onClick={() => setIpOpen((value) => !value)}>
                  IP restriction (advanced)
                </button>
                {ipOpen ? (
                  <div className="mt-3 grid gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="all_ips_allowed"
                        defaultChecked={editing.all_ips_allowed ?? true}
                      />
                      Allow all IPs
                    </label>
                    <Field label="Allowed IPs (comma separated)" hint="Used when all IPs is off">
                      <Input name="allowed_ips" defaultValue={(editing.allowed_ips ?? []).join(", ")} />
                    </Field>
                    <Field label="Description">
                      <Input name="description" defaultValue={editing.description} />
                    </Field>
                  </div>
                ) : (
                  <>
                    <input type="hidden" name="all_ips_allowed" value={editing.all_ips_allowed ? "on" : ""} />
                    <input type="hidden" name="allowed_ips" value={(editing.allowed_ips ?? []).join(", ")} />
                  </>
                )}
              </div>
            ) : null}
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
