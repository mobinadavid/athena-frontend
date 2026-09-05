import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { Permission, PermissionGroup, Role } from "@/lib/types/models";

export interface PermissionGroupPayload {
  name: string;
  title: { en: string; fa?: string };
  permissions: string[];
  description?: string;
  is_active?: boolean;
}

export interface RolePayload {
  name: string;
  title: string;
  permission_groups: string[];
  description?: string;
  is_active?: boolean;
}

export const authorizationApi = {
  permissions(params?: PaginationParams) {
    return apiClient.get<{ permissions: Paginated<Permission> }>(
      `/authorization/permissions${toQuery({ ...params })}`,
    );
  },

  permissionGroups(params?: PaginationParams) {
    return apiClient.get<{ permission_groups: Paginated<PermissionGroup> }>(
      `/authorization/permission-groups${toQuery({ ...params })}`,
    );
  },

  permissionGroup(uuid: string) {
    return apiClient.get<{ permission_group: PermissionGroup }>(
      `/authorization/permission-groups/${uuid}`,
    );
  },

  createPermissionGroup(payload: PermissionGroupPayload) {
    return apiClient.post<{ permission_group: PermissionGroup }>(
      "/authorization/permission-groups",
      payload,
    );
  },

  updatePermissionGroup(uuid: string, payload: PermissionGroupPayload) {
    return apiClient.put<{ permission_group: PermissionGroup }>(
      `/authorization/permission-groups/${uuid}`,
      payload,
    );
  },

  deletePermissionGroup(uuid: string) {
    return apiClient.delete<Record<string, never>>(
      `/authorization/permission-groups/${uuid}`,
    );
  },

  roles(params?: PaginationParams) {
    return apiClient.get<{ roles: Paginated<Role> }>(
      `/authorization/roles${toQuery({ ...params })}`,
    );
  },

  role(uuid: string) {
    return apiClient.get<{ role: Role }>(`/authorization/roles/${uuid}`);
  },

  createRole(payload: RolePayload) {
    return apiClient.post<{ role: Role }>("/authorization/roles", payload);
  },

  updateRole(uuid: string, payload: RolePayload) {
    return apiClient.put<{ role: Role }>(`/authorization/roles/${uuid}`, payload);
  },

  deleteRole(uuid: string) {
    return apiClient.delete<Record<string, never>>(`/authorization/roles/${uuid}`);
  },
};
