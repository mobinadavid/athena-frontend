"use client";

import { useState } from "react";
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
import type { ExplorerPayload } from "@/lib/api/explorers";
import {
  useBlockchainOptions,
  useDeleteExplorer,
  useExplorers,
  useUpdateExplorer,
} from "@/lib/hooks/use-admin-data";
import type { BlockchainExplorer } from "@/lib/types/models";
import { blockchainLabel, explorerChainNames, formatDate } from "@/lib/utils/format";

function chainNames(explorer: BlockchainExplorer) {
  return explorerChainNames(explorer);
}

export default function ExplorersPage() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<BlockchainExplorer | null>(null);
  const list = useExplorers({ page, page_size: 10 });
  const chains = useBlockchainOptions();
  const update = useUpdateExplorer();
  const remove = useDeleteExplorer();
  const items = list.data?.items ?? [];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const selected = (chains.data ?? [])
      .filter((chain) => form.get(`chain_${chain.name}`) === "on")
      .map((chain) => chain.name);
    const payload: ExplorerPayload = {
      name: String(form.get("name")),
      base_url: String(form.get("base_url")),
      is_active: form.get("is_active") === "on",
      is_default: form.get("is_default") === "on",
      blockchains: selected,
    };
    await update.mutateAsync({ uuid: editing.uuid, payload });
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Blockchain Explorers"
        description="Each explorer URL is used with a backend driver for that chain (Etherscan, Tronscan, BscScan, BtcScan). Adding a new explorer type requires a matching driver in the API. You can edit URLs and linked chains for the explorers that already exist."
      />
      <Card>
        <CardContent className="pt-4">
          {list.isLoading ? <Skeleton className="h-12 w-full" /> : null}
          {list.isError ? <QueryError error={list.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Base URL</th>
                  <th className="px-2 py-2 font-medium">Chains</th>
                  <th className="px-2 py-2 font-medium">Flags</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.uuid}>
                    <td className="px-2 py-3 font-medium">{item.name}</td>
                    <td className="px-2 py-3 font-mono text-xs">{item.base_url}</td>
                    <td className="px-2 py-3 text-xs">{chainNames(item).join(", ") || "—"}</td>
                    <td className="px-2 py-3">
                      <div className="flex gap-1">
                        <StatusBadge status={item.is_active ? "active" : "inactive"} />
                        {item.is_default ? <StatusBadge status="default" /> : null}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button size="xs" variant="outline" onClick={() => setEditing(item)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this explorer?")) remove.mutate(item.uuid);
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
          <p className="mt-2 text-[11px] text-muted-foreground">
            Created {items[0] ? formatDate(items[0].created_at) : ""}
          </p>
          <PaginationBar page={page} totalPages={list.data?.total_pages ?? 1} onPageChange={setPage} />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit explorer</DialogTitle>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={submit}>
            <Field label="Name">
              <Input name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Base URL">
              <Input name="base_url" defaultValue={editing?.base_url} required />
            </Field>
            <div className="space-y-2">
              <p className="text-sm font-medium">Blockchains</p>
              {(chains.data ?? []).map((chain) => (
                <label key={chain.uuid} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`chain_${chain.name}`}
                    defaultChecked={editing ? chainNames(editing).includes(chain.name) : false}
                  />
                  {blockchainLabel(chain)}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_default" defaultChecked={editing?.is_default} />
              Default explorer
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
