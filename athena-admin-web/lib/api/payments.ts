import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { Deposit, PaymentRequest } from "@/lib/types/models";

export interface PaymentListParams extends PaginationParams {
  status?: string;
}

export const paymentsApi = {
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

export const depositsApi = {
  list(params?: PaginationParams) {
    return apiClient.get<{ deposits: Paginated<Deposit> }>(
      `/deposits${toQuery({ ...params })}`,
    );
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ deposit: Deposit }>(`/deposits/${uuid}`);
  },
};
