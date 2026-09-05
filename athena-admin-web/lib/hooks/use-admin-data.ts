"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardApi } from "@/lib/api/dashboard";
import { blockchainsApi } from "@/lib/api/blockchains";
import { walletsApi, type AllocateWalletPayload, type WalletAddressPayload, type WalletListParams } from "@/lib/api/wallets";
import { explorersApi, type ExplorerPayload } from "@/lib/api/explorers";
import { depositsApi, paymentsApi, type PaymentListParams } from "@/lib/api/payments";
import { usersApi, type CreateUserPayload } from "@/lib/api/users";
import { adminsApi, type CreateAdminPayload, type UpdateAdminPayload } from "@/lib/api/admins";
import {
  authorizationApi,
  type PermissionGroupPayload,
  type RolePayload,
} from "@/lib/api/authorization";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import { errorMessage } from "@/components/query-error";
import type { PaginationParams } from "@/lib/types/api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: ["dashboard", "summary"] as const,
  overTime: (days: number) => ["dashboard", "deposits-over-time", days] as const,
  byBlockchain: ["dashboard", "deposits-by-blockchain"] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: dashboardApi.summary,
  });
}

export function useDepositsOverTime(days: number) {
  return useQuery({
    queryKey: dashboardKeys.overTime(days),
    queryFn: async () => (await dashboardApi.depositsOverTime(days)).deposits_over_time,
  });
}

export function useDepositsByBlockchain() {
  return useQuery({
    queryKey: dashboardKeys.byBlockchain,
    queryFn: async () => (await dashboardApi.depositsByBlockchain()).deposits_by_blockchain,
  });
}

export function useBlockchains(params: PaginationParams) {
  return usePaginatedQuery(
    ["blockchains"],
    async (page) => (await blockchainsApi.list(page)).blockchains,
    params,
  );
}

export function useBlockchainOptions() {
  return useQuery({
    queryKey: ["blockchains", "options"],
    queryFn: async () =>
      (await blockchainsApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }))
        .blockchains.items,
  });
}

export function useWallets(params: WalletListParams) {
  return usePaginatedQuery(
    ["wallets"],
    async (page) => (await walletsApi.list({ ...params, ...page })).wallet_addresses,
    params,
  );
}

export function useWallet(uuid: string) {
  return useQuery({
    queryKey: ["wallets", uuid],
    queryFn: async () => (await walletsApi.getByUuid(uuid)).wallet_address,
    enabled: Boolean(uuid),
  });
}

export function useWalletTransactions(uuid: string, page = 1) {
  return usePaginatedQuery(
    ["wallets", uuid, "transactions"],
    async (params) => (await walletsApi.transactions(uuid, params)).transactions,
    { page, page_size: 10, sort_by: "created_at", sort_order: "desc" },
    { enabled: Boolean(uuid) },
  );
}

function toastError(error: unknown, fallback: string) {
  toast.error(errorMessage(error, fallback));
}

export function useAllocateWallets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AllocateWalletPayload) => walletsApi.allocate(payload),
    onSuccess: async () => {
      toast.success("Wallets allocated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => toastError(error, "Could not allocate wallets"),
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletAddressPayload) => walletsApi.create(payload),
    onSuccess: async () => {
      toast.success("Address added");
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (error) => toastError(error, "Could not add address"),
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: WalletAddressPayload }) =>
      walletsApi.update(uuid, payload),
    onSuccess: async () => {
      toast.success("Address updated");
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (error) => toastError(error, "Could not update address"),
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.delete,
    onSuccess: async () => {
      toast.success("Address deleted");
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (error) => toastError(error, "Could not delete address"),
  });
}

export function useExplorers(params: PaginationParams) {
  return usePaginatedQuery(
    ["explorers"],
    async (page) => (await explorersApi.list(page)).blockchain_explorers,
    params,
  );
}

export function usePayments(params: PaymentListParams) {
  return usePaginatedQuery(
    ["payments"],
    async (page) => (await paymentsApi.list({ ...params, ...page })).payment_requests,
    params,
  );
}

export function usePayment(uuid: string) {
  return useQuery({
    queryKey: ["payments", uuid],
    queryFn: async () => (await paymentsApi.getByUuid(uuid)).payment_request,
    enabled: Boolean(uuid),
  });
}

export function usePaymentTransactions(uuid: string, page = 1) {
  return usePaginatedQuery(
    ["payments", uuid, "transactions"],
    async (params) => (await paymentsApi.transactions(uuid, params)).transactions,
    { page, page_size: 10 },
    { enabled: Boolean(uuid) },
  );
}

export function useDeposits(params: PaginationParams) {
  return usePaginatedQuery(
    ["deposits"],
    async (page) => (await depositsApi.list(page)).deposits,
    params,
  );
}

export function useUsers(params: PaginationParams) {
  return usePaginatedQuery(["users"], async (page) => (await usersApi.list(page)).users, params);
}

export function useUserProfile(uuid: string) {
  return useQuery({
    queryKey: ["users", "profile", uuid],
    queryFn: async () => (await usersApi.profile(uuid)).user,
    enabled: Boolean(uuid),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: async () => {
      toast.success("User created");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toastError(error, "Could not create user"),
  });
}

export function useAdmins(params: PaginationParams) {
  return usePaginatedQuery(["admins"], async (page) => (await adminsApi.list(page)).admins, params);
}

export function useAdmin(uuid: string) {
  return useQuery({
    queryKey: ["admins", uuid],
    queryFn: async () => (await adminsApi.getByUuid(uuid)).admin,
    enabled: Boolean(uuid),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => adminsApi.create(payload),
    onSuccess: async () => {
      toast.success("Admin created");
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error) => toastError(error, "Could not create admin"),
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: UpdateAdminPayload }) =>
      adminsApi.update(uuid, payload),
    onSuccess: async () => {
      toast.success("Admin updated");
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error) => toastError(error, "Could not update admin"),
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminsApi.delete,
    onSuccess: async () => {
      toast.success("Admin deleted");
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (error) => toastError(error, "Could not delete admin"),
  });
}

export function useRolesList(params: PaginationParams) {
  return usePaginatedQuery(
    ["roles"],
    async (page) => (await authorizationApi.roles(page)).roles,
    params,
  );
}

export function useRoleOptions() {
  return useQuery({
    queryKey: ["roles", "options"],
    queryFn: async () =>
      (await authorizationApi.roles({ page: 1, page_size: 100 })).roles.items,
  });
}

export function usePermissionGroups(params: PaginationParams) {
  return usePaginatedQuery(
    ["permission-groups"],
    async (page) => (await authorizationApi.permissionGroups(page)).permission_groups,
    params,
  );
}

export function usePermissionGroupOptions() {
  return useQuery({
    queryKey: ["permission-groups", "options"],
    queryFn: async () =>
      (await authorizationApi.permissionGroups({ page: 1, page_size: 100 })).permission_groups
        .items,
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: async () =>
      (await authorizationApi.permissions({ page: 1, page_size: 200 })).permissions.items,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePayload) => authorizationApi.createRole(payload),
    onSuccess: async () => {
      toast.success("Role created");
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => toastError(error, "Could not create role"),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: RolePayload }) =>
      authorizationApi.updateRole(uuid, payload),
    onSuccess: async () => {
      toast.success("Role updated");
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => toastError(error, "Could not update role"),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authorizationApi.deleteRole,
    onSuccess: async () => {
      toast.success("Role deleted");
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => toastError(error, "Could not delete role"),
  });
}

export function useCreatePermissionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PermissionGroupPayload) =>
      authorizationApi.createPermissionGroup(payload),
    onSuccess: async () => {
      toast.success("Permission group created");
      await queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
    },
    onError: (error) => toastError(error, "Could not create permission group"),
  });
}

export function useUpdatePermissionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: PermissionGroupPayload }) =>
      authorizationApi.updatePermissionGroup(uuid, payload),
    onSuccess: async () => {
      toast.success("Permission group updated");
      await queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
    },
    onError: (error) => toastError(error, "Could not update permission group"),
  });
}

export function useDeletePermissionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authorizationApi.deletePermissionGroup,
    onSuccess: async () => {
      toast.success("Permission group deleted");
      await queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
    },
    onError: (error) => toastError(error, "Could not delete permission group"),
  });
}

export function useCreateBlockchain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockchainsApi.create,
    onSuccess: async () => {
      toast.success("Blockchain created");
      await queryClient.invalidateQueries({ queryKey: ["blockchains"] });
    },
    onError: (error) => toastError(error, "Could not create blockchain"),
  });
}

export function useUpdateBlockchain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: Parameters<typeof blockchainsApi.update>[1] }) =>
      blockchainsApi.update(uuid, payload),
    onSuccess: async () => {
      toast.success("Blockchain updated");
      await queryClient.invalidateQueries({ queryKey: ["blockchains"] });
    },
    onError: (error) => toastError(error, "Could not update blockchain"),
  });
}

export function useDeleteBlockchain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockchainsApi.delete,
    onSuccess: async () => {
      toast.success("Blockchain deleted");
      await queryClient.invalidateQueries({ queryKey: ["blockchains"] });
    },
    onError: (error) => toastError(error, "Could not delete blockchain"),
  });
}

export function useCreateExplorer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: explorersApi.create,
    onSuccess: async () => {
      toast.success("Explorer created");
      await queryClient.invalidateQueries({ queryKey: ["explorers"] });
    },
    onError: (error) => toastError(error, "Could not create explorer"),
  });
}

export function useUpdateExplorer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: ExplorerPayload }) =>
      explorersApi.update(uuid, payload),
    onSuccess: async () => {
      toast.success("Explorer updated");
      await queryClient.invalidateQueries({ queryKey: ["explorers"] });
    },
    onError: (error) => toastError(error, "Could not update explorer"),
  });
}

export function useDeleteExplorer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: explorersApi.delete,
    onSuccess: async () => {
      toast.success("Explorer deleted");
      await queryClient.invalidateQueries({ queryKey: ["explorers"] });
    },
    onError: (error) => toastError(error, "Could not delete explorer"),
  });
}
