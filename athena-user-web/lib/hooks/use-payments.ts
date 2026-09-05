"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentsApi, type CreatePaymentPayload, type PaymentListParams } from "@/lib/api/payments";
import { dashboardKeys } from "@/lib/hooks/use-dashboard";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { isApiError } from "@/lib/types/api";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params: PaymentListParams) => ["payments", "list", params] as const,
  detail: (uuid: string) => ["payments", uuid] as const,
  transactions: (uuid: string) => ["payments", uuid, "transactions"] as const,
};

export function usePayments(params: PaymentListParams) {
  return usePaginatedQuery(
    ["payments", "list"],
    async (pageParams) => {
      const data = await paymentsApi.list({ ...params, ...pageParams });
      return data.payment_requests;
    },
    params,
  );
}

export function usePayment(uuid: string) {
  return useQuery({
    queryKey: paymentKeys.detail(uuid),
    queryFn: async () => {
      const data = await paymentsApi.getByUuid(uuid);
      return data.payment_request;
    },
    enabled: Boolean(uuid),
  });
}

export function usePaymentTransactions(uuid: string, page = 1, pageSize = 10) {
  return usePaginatedQuery(
    paymentKeys.transactions(uuid),
    async (params) => {
      const data = await paymentsApi.transactions(uuid, params);
      return data.transactions;
    },
    { page, page_size: pageSize, sort_by: "created_at", sort_order: "desc" },
    { enabled: Boolean(uuid) },
  );
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.create(payload),
    onSuccess: async () => {
      toast.success("Payment request created");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
      ]);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : "Could not create payment request");
    },
  });
}
