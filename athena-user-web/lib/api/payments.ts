import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { Deposit, PaymentRequest } from "@/lib/types/models";

export interface PaymentListParams extends PaginationParams {
  status?: "pending" | "confirmed" | "expired" | "";
}

export interface CreatePaymentPayload {
  blockchain: string;
  count: number;
  expected_amount?: number;
}

export const paymentsApi = {
  create(payload: CreatePaymentPayload) {
    return apiClient.post<{ payment_request: PaymentRequest }>("/payments", payload);
  },

  list(params?: PaymentListParams) {
    return apiClient.get<{ payment_requests: Paginated<PaymentRequest> }>(
      `/payments${toQuery({ ...params })}`,
    );
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ payment_request: PaymentRequest }>(`/payments/${uuid}`);
  },

  transactions(uuid: string, params?: PaginationParams) {
    return apiClient.get<{ transactions: Paginated<Deposit> }>(
      `/payments/${uuid}/transactions${toQuery({ ...params })}`,
    );
  },
};
