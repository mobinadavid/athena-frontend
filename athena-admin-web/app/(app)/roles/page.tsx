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
import {
  useCreateRole,
  useDeleteRole,
  usePermissionGroupOptions,
  useRolesList,
  useUpdateRole,
} from "@/lib/hooks/use-admin-data";
import type { Role } from "@/lib/types/models";
import { formatDate } from "@/lib/utils/format";

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const roles = useRolesList({ page, page_size: 10 });
  const groups = usePermissionGroupOptions();
  const create = useCreateRole();
  const update = useUpdateRole();
  const remove = useDeleteRole();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const permission_groups = (groups.data ?? [])
      .filter((group) => form.get(`group_${group.uuid}`) === "on")
      .map((group) => group.uuid);
    const payload = {
      name: String(form.get("name")),
      title: String(form.get("title")),
      description: String(form.get("description") || "") || undefined,
      permission_groups,
      is_active: form.get("is_active") === "on",
    };
    if (editing) await update.mutateAsync({ uuid: editing.uuid, payload });
    else await create.mutateAsync(payload);
    setOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Roles are built from permission groups, not raw permissions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/roles/permission-groups">Permission groups</Link>
            </Button>
            <Button onClick={() => setOpen(true)}>New role</Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-4">
          {roles.isLoading ? <Skeleton className="h-12 w-full" /> : null}
          {roles.isError ? <QueryError error={roles.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Role</th>
                  <th className="px-2 py-2 font-medium">Groups</th>
                  <th className="px-2 py-2 font-medium">Assignees</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {(roles.data?.items ?? []).map((role) => (
                  <tr key={role.uuid}>
                    <td className="px-2 py-3">
                      <p className="font-medium">{role.title}</p>
                      <p className="text-[11px] text-muted-foreground">{role.name}</p>
                    </td>
                    <td className="px-2 py-3">{role.permission_group_count ?? role.permission_groups?.length ?? 0}</td>
                    <td className="px-2 py-3">{role.total_assignees ?? 0}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={role.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">{formatDate(role.created_at)}</td>
                    <td className="px-2 py-3 text-right">
                      <Button size="xs" variant="outline" onClick={() => setEditing(role)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this role?")) remove.mutate(role.uuid);
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
          <PaginationBar page={page} totalPages={roles.data?.total_pages ?? 1} onPageChange={setPage} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "New role"}</DialogTitle>
          </DialogHeader>
          <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={submit}>
            <Field label="Name">
              <Input name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Title">
              <Input name="title" defaultValue={editing?.title} required />
            </Field>
            <Field label="Description">
              <Input name="description" defaultValue={editing?.description} />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium">Permission groups</p>
              {(groups.data ?? []).map((group) => (
                <label key={group.uuid} className="mb-1 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`group_${group.uuid}`}
                    defaultChecked={Boolean(
                      editing?.permission_groups?.some((item) => item.uuid === group.uuid),
                    )}
                  />
                  {typeof group.title === "string" ? group.title : group.title?.en || group.name}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
              Active
            </label>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
