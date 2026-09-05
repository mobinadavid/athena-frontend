import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { UserModel } from "@/lib/types/models";

export interface CreateUserPayload {
  national_identity_code?: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
}

export const usersApi = {
  list(params?: PaginationParams) {
    return apiClient.get<{ users: Paginated<UserModel> }>(`/users${toQuery({ ...params })}`);
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ user: UserModel }>(`/users/${uuid}`);
  },

  profile(uuid: string) {
    return apiClient.get<{ user: UserModel }>(`/users/profile/${uuid}`);
  },

  create(payload: CreateUserPayload) {
    return apiClient.post<{ user: UserModel }>("/users", payload);
  },

  update(uuid: string, payload: Partial<CreateUserPayload> & { is_active?: boolean }) {
    return apiClient.put<{ user: UserModel }>(`/users/${uuid}`, payload);
  },
};
