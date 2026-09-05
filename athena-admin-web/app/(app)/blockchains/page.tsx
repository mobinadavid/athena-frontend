"use client";

import { useState } from "react";
import { Field } from "@/components/auth/auth-card";
import { BlockchainChip } from "@/components/blockchain-chip";
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
import type { BlockchainPayload } from "@/lib/api/blockchains";
import {
  useBlockchains,
  useCreateBlockchain,
  useDeleteBlockchain,
  useUpdateBlockchain,
} from "@/lib/hooks/use-admin-data";
import type { Blockchain } from "@/lib/types/models";
import { blockchainLabel, formatDate } from "@/lib/utils/format";

function payloadFromForm(form: FormData): BlockchainPayload {
  return {
    name: String(form.get("name")),
    native_asset: String(form.get("native_asset")),
    is_active: form.get("is_active") === "on",
    title: {
      en: String(form.get("title_en")),
      fa: String(form.get("title_fa") || "") || undefined,
    },
  };
}

export default function BlockchainsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Blockchain | null>(null);
  const list = useBlockchains({ page, page_size: 10, global_search: search || undefined });
  const create = useCreateBlockchain();
  const update = useUpdateBlockchain();
  const remove = useDeleteBlockchain();
  const items = list.data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Blockchains"
        description="Networks available for wallet allocation."
        actions={<Button onClick={() => setOpen(true)}>New blockchain</Button>}
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
          {list.isLoading ? <Skeleton className="h-12 w-full" /> : null}
          {list.isError ? <QueryError error={list.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Asset</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((chain) => (
                  <tr key={chain.uuid}>
                    <td className="px-2 py-3">
                      <BlockchainChip name={blockchainLabel(chain)} />
                      <p className="mt-1 text-[11px] text-muted-foreground">{chain.name}</p>
                    </td>
                    <td className="px-2 py-3">{chain.native_asset}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={chain.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">
                      {formatDate(chain.created_at)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button size="xs" variant="outline" onClick={() => setEditing(chain)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this blockchain?")) remove.mutate(chain.uuid);
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
          <PaginationBar page={page} totalPages={list.data?.total_pages ?? 1} onPageChange={setPage} />
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
            <DialogTitle>{editing ? "Edit blockchain" : "New blockchain"}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const payload = payloadFromForm(new FormData(event.currentTarget));
              if (editing) await update.mutateAsync({ uuid: editing.uuid, payload });
              else await create.mutateAsync(payload);
              setOpen(false);
              setEditing(null);
            }}
          >
            <Field label="Name">
              <Input name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Native asset">
              <Input name="native_asset" defaultValue={editing?.native_asset} required />
            </Field>
            <Field label="Title (English)">
              <Input name="title_en" defaultValue={editing?.title?.en} required />
            </Field>
            <Field label="Title (Persian)">
              <Input name="title_fa" defaultValue={editing?.title?.fa} />
            </Field>
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
