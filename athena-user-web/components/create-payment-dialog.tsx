"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
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
import { useBlockchains } from "@/lib/hooks/use-blockchains";
import { useCreatePayment } from "@/lib/hooks/use-payments";
import { applyApiFieldErrors } from "@/lib/utils/form-errors";
import { blockchainLabel } from "@/lib/utils/format";
import {
  createPaymentSchema,
  type CreatePaymentValues,
} from "@/lib/validations/payments";

export function CreatePaymentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const chains = useBlockchains();
  const create = useCreatePayment();
  const form = useForm<CreatePaymentValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      blockchain: "",
      count: 1,
      expected_amount: "",
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New payment request</DialogTitle>
          <DialogDescription>
            Allocate wallet address(es) on a blockchain to receive a payment.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const expected = values.expected_amount?.trim();
              const amount = expected ? Number(expected) : undefined;
              if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) {
                form.setError("expected_amount", { message: "Enter a positive amount" });
                return;
              }
              await create.mutateAsync({
                blockchain: values.blockchain,
                count: Number(values.count),
                expected_amount: amount,
              });
              onOpenChange(false);
            } catch (error) {
              applyApiFieldErrors(error, form.setError);
            }
          })}
        >
          <Field
            label="Blockchain"
            htmlFor="blockchain"
            error={form.formState.errors.blockchain?.message}
          >
            <Controller
              control={form.control}
              name="blockchain"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="blockchain" className="w-full">
                    <SelectValue placeholder="Select a chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {(chains.data ?? []).map((chain) => (
                      <SelectItem key={chain.uuid} value={chain.name}>
                        {blockchainLabel(chain)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {chains.isError ? (
            <p className="text-xs text-destructive">
              Could not load blockchains. Check that GET /blockchains is available.
            </p>
          ) : null}
          <Field
            label="Address count"
            htmlFor="count"
            hint="Allocate between 1 and 20 addresses"
            error={form.formState.errors.count?.message}
          >
            <Input
              id="count"
              type="number"
              min={1}
              max={20}
              {...form.register("count", { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Expected amount (optional)"
            htmlFor="expected_amount"
            error={form.formState.errors.expected_amount?.message}
          >
            <Input
              id="expected_amount"
              type="number"
              step="any"
              min={0}
              placeholder="Leave empty if unspecified"
              {...form.register("expected_amount")}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Request addresses"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
