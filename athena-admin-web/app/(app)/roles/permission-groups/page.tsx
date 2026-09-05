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
import { authorizationApi } from "@/lib/api/authorization";
import {
  useAllPermissions,
  useCreatePermissionGroup,
  useDeletePermissionGroup,
  usePermissionGroups,
  useUpdatePermissionGroup,
} from "@/lib/hooks/use-admin-data";
import type { PermissionGroup } from "@/lib/types/models";
import { formatDate, localized } from "@/lib/utils/format";

function prefix(name: string) {
  const parts = name.split("-");
  return parts.length > 1 ? parts.slice(0, -1).join("-") : name;
}

export default function PermissionGroupsPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PermissionGroup | null>(null);
  const groups = usePermissionGroups({ page, page_size: 10 });
  const permissions = useAllPermissions();
  const create = useCreatePermissionGroup();
  const update = useUpdatePermissionGroup();
  const remove = useDeletePermissionGroup();

  const grouped = (() => {
    const map = new Map<string, NonNullable<typeof permissions.data>>();
    for (const item of permissions.data ?? []) {
      const key = prefix(item.name);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  })();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selected = (permissions.data ?? [])
      .filter((item) => form.get(`perm_${item.uuid}`) === "on")
      .map((item) => item.uuid);
    const payload = {
      name: String(form.get("name")),
      title: { en: String(form.get("title_en")), fa: String(form.get("title_fa") || "") || undefined },
      description: String(form.get("description") || "") || undefined,
      permissions: selected,
      is_active: form.get("is_active") === "on",
    };
    if (editing) await update.mutateAsync({ uuid: editing.uuid, payload });
    else await create.mutateAsync(payload);
    setOpen(false);
    setEditing(null);
  }

  async function startEdit(group: PermissionGroup) {
    try {
      const detail = await authorizationApi.permissionGroup(group.uuid);
      setEditing(detail.permission_group);
    } catch {
      setEditing(group);
    }
  }

  return (
    <div>
      <PageHeader
        title="Permission groups"
        description="Assign raw permissions here. Roles then pick these groups."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/roles">Back to roles</Link>
            </Button>
            <Button onClick={() => setOpen(true)}>New group</Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-4">
          {groups.isLoading ? <Skeleton className="h-12 w-full" /> : null}
          {groups.isError ? <QueryError error={groups.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Group</th>
                  <th className="px-2 py-2 font-medium">Permissions</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {(groups.data?.items ?? []).map((group) => (
                  <tr key={group.uuid}>
                    <td className="px-2 py-3">
                      <p className="font-medium">{localized(group.title)}</p>
                      <p className="text-[11px] text-muted-foreground">{group.name}</p>
                    </td>
                    <td className="px-2 py-3">{group.permissions?.length ?? "—"}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={group.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">{formatDate(group.created_at)}</td>
                    <td className="px-2 py-3 text-right">
                      <Button size="xs" variant="outline" onClick={() => startEdit(group)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this permission group?")) remove.mutate(group.uuid);
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
          <PaginationBar page={page} totalPages={groups.data?.total_pages ?? 1} onPageChange={setPage} />
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit permission group" : "New permission group"}</DialogTitle>
          </DialogHeader>
          <form className="grid max-h-[70vh] gap-3 overflow-y-auto" onSubmit={submit}>
            <Field label="Name (english, no spaces)">
              <Input name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Title (English)">
              <Input
                name="title_en"
                defaultValue={typeof editing?.title === "string" ? editing.title : editing?.title?.en}
                required
              />
            </Field>
            <Field label="Title (Persian)">
              <Input
                name="title_fa"
                defaultValue={typeof editing?.title === "string" ? "" : editing?.title?.fa}
              />
            </Field>
            <Field label="Description">
              <Input name="description" defaultValue={editing?.description} />
            </Field>
            <div className="space-y-4">
              <p className="text-sm font-medium">Permissions</p>
              {permissions.isError ? <QueryError error={permissions.error} /> : null}
              {grouped.map(([groupName, items]) => (
                <div key={groupName}>
                  <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {groupName}
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {(items ?? []).map((item) => (
                      <label key={item.uuid} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name={`perm_${item.uuid}`}
                          defaultChecked={Boolean(
                            editing?.permissions?.some((perm) => perm.uuid === item.uuid),
                          )}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
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
