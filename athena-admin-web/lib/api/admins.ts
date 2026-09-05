import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { AdminUser } from "@/lib/types/models";

export interface CreateAdminPayload {
  first_name: string;
  last_name: string;
  mobile: string;
  username: string;
  password: string;
  profile_image?: string;
  roles: string[];
  is_active: boolean;
}

export interface UpdateAdminPayload {
  first_name: string;
  last_name: string;
  mobile: string;
  username: string;
  password?: string;
  profile_image?: string;
  roles: string[];
  description?: string;
  all_ips_allowed: boolean;
  allowed_ips?: string[];
  is_active?: boolean;
}

export const adminsApi = {
  list(params?: PaginationParams) {
    return apiClient.get<{ admins: Paginated<AdminUser> }>(`/admins${toQuery({ ...params })}`);
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ admin: AdminUser }>(`/admins/${uuid}`);
  },

  getProfile() {
    return apiClient.post<{ admin: AdminUser }>("/admins/get-profile", {});
  },

  create(payload: CreateAdminPayload) {
    return apiClient.post<{ admin: AdminUser }>("/admins", payload);
  },

  update(uuid: string, payload: UpdateAdminPayload) {
    return apiClient.patch<{ admin: AdminUser }>(`/admins/${uuid}`, payload);
  },

  delete(uuid: string) {
    return apiClient.delete<Record<string, never>>(`/admins/${uuid}`);
  },
};
