"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Field } from "@/components/auth/auth-card";
import { BlockchainChip } from "@/components/blockchain-chip";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllocateWallets,
  useBlockchainOptions,
  useCreateWallet,
  useDeleteWallet,
  useUpdateWallet,
  useWallets,
} from "@/lib/hooks/use-admin-data";
import type { WalletAddress } from "@/lib/types/models";
import { blockchainLabel, formatDate, truncateAddress } from "@/lib/utils/format";

export default function WalletAddressesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [blockchain, setBlockchain] = useState("");
  const [active, setActive] = useState("");
  const [allocated, setAllocated] = useState("");
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [editing, setEditing] = useState<WalletAddress | null>(null);
  const [allocateChain, setAllocateChain] = useState("");
  const [manualChain, setManualChain] = useState("");

  const chains = useBlockchainOptions();
  const wallets = useWallets({
    page,
    page_size: 10,
    global_search: search || undefined,
    blockchain: blockchain || undefined,
    is_active: active || undefined,
    allocated: allocated || undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const allocate = useAllocateWallets();
  const create = useCreateWallet();
  const update = useUpdateWallet();
  const remove = useDeleteWallet();
  const items = wallets.data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Wallet Addresses"
        description="Pool of addresses that can be allocated to payment requests."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setManualChain("");
                setManualOpen(true);
              }}
            >
              Add Address Manually
            </Button>
            <Button
              onClick={() => {
                setAllocateChain("");
                setAllocateOpen(true);
              }}
            >
              <Plus data-icon="inline-start" />
              Allocate Wallets
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-4">
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
            <Select
              value={blockchain || "all"}
              onValueChange={(value) => {
                setPage(1);
                setBlockchain(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chains</SelectItem>
                {(chains.data ?? []).map((chain) => (
                  <SelectItem key={chain.uuid} value={chain.name}>
                    {blockchainLabel(chain)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={active || "all"}
              onValueChange={(value) => {
                setPage(1);
                setActive(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Active & inactive</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={allocated || "all"}
              onValueChange={(value) => {
                setPage(1);
                setAllocated(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Allocation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Allocated & free</SelectItem>
                <SelectItem value="true">Allocated</SelectItem>
                <SelectItem value="false">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {wallets.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}
          {wallets.isError ? <QueryError error={wallets.error} /> : null}
          {!wallets.isLoading && items.length === 0 && !wallets.isError ? (
            <p className="text-sm text-muted-foreground">No wallet addresses found.</p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Address</th>
                  <th className="px-2 py-2 font-medium">Chain</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Allocated</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((wallet) => (
                  <tr key={wallet.uuid}>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/wallet-addresses/${wallet.uuid}`} className="font-mono text-xs hover:underline">
                          {truncateAddress(wallet.wallet_address, 8)}
                        </Link>
                        <CopyButton value={wallet.wallet_address} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{wallet.name}</p>
                    </td>
                    <td className="px-2 py-3">
                      <BlockchainChip name={blockchainLabel(wallet.blockchain)} />
                    </td>
                    <td className="px-2 py-3">
                      <StatusBadge status={wallet.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">
                      {wallet.allocated_at ? formatDate(wallet.allocated_at) : "Free"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="xs" variant="outline" asChild>
                          <Link href={`/wallet-addresses/${wallet.uuid}`}>Tx</Link>
                        </Button>
                        <Button size="xs" variant="outline" onClick={() => {
                          setManualChain(wallet.blockchain?.name ?? "");
                          setEditing(wallet);
                        }}>
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Delete this address?")) remove.mutate(wallet.uuid);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            page={page}
            totalPages={wallets.data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate wallets</DialogTitle>
            <DialogDescription>Request 1–20 addresses on a blockchain.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const expected = String(form.get("expected_amount") || "");
              if (!allocateChain) return;
              await allocate.mutateAsync({
                blockchain: allocateChain,
                count: Number(form.get("count")),
                expected_amount: expected ? Number(expected) : undefined,
              });
              setAllocateOpen(false);
            }}
          >
            <Field label="Blockchain">
              <Select value={allocateChain} onValueChange={setAllocateChain} required>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {(chains.data ?? []).map((chain) => (
                    <SelectItem key={chain.uuid} value={chain.name}>
                      {blockchainLabel(chain)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Count">
              <Input name="count" type="number" min={1} max={20} defaultValue={1} />
            </Field>
            <Field label="Expected amount (optional)">
              <Input name="expected_amount" type="number" step="any" />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={allocate.isPending}>
                Allocate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={manualOpen || Boolean(editing)} onOpenChange={(open) => {
        if (!open) {
          setManualOpen(false);
          setEditing(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "Add address manually"}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              if (!manualChain) return;
              const payload = {
                wallet_address: String(form.get("wallet_address")),
                name: String(form.get("name")),
                webhook_url: String(form.get("webhook_url")),
                blockchain_name: manualChain,
                is_active: form.get("is_active") === "on",
              };
              if (editing) {
                await update.mutateAsync({ uuid: editing.uuid, payload });
              } else {
                await create.mutateAsync(payload);
              }
              setManualOpen(false);
              setEditing(null);
            }}
          >
            <Field label="Name">
              <Input name="name" defaultValue={editing?.name} placeholder="Treasury ETH 01" required />
            </Field>
            <Field label="Address">
              <Input
                name="wallet_address"
                defaultValue={editing?.wallet_address}
                placeholder="0x… or T…"
                required
              />
            </Field>
            <Field label="Webhook URL">
              <Input
                name="webhook_url"
                defaultValue={editing?.webhook_url}
                placeholder="https://example.com/webhook"
                required
              />
            </Field>
            <Field label="Blockchain">
              <Select value={manualChain} onValueChange={setManualChain} required>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {(chains.data ?? []).map((chain) => (
                    <SelectItem key={chain.uuid} value={chain.name}>
                      {blockchainLabel(chain)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
              Active
            </label>
            <DialogFooter>
              <Button type="submit" disabled={create.isPending || update.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
