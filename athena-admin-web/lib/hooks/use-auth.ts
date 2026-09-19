"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { errorMessage } from "@/components/query-error";
import { authApi } from "@/lib/api/auth";
import { tokensApi } from "@/lib/api/tokens";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isTwoFaRequired, type LoginResponse } from "@/lib/types/auth";

function applyLoginResult(data: LoginResponse) {
  const store = useAuthStore.getState();
  if (isTwoFaRequired(data)) {
    store.setLoginKey(data.login_key);
    return { twoFa: true as const };
  }
  store.setAccessToken(data.access_tokens.access_token_string);
  store.setLoginKey(null);
  return { twoFa: false as const };
}

export function useCurrentSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  return {
    accessToken,
    isHydrated,
    isAuthenticated: Boolean(accessToken),
  };
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const result = applyLoginResult(data);
      if (result.twoFa) {
        toast.message("Two-factor authentication required");
        router.push("/two-fa");
        return;
      }
      toast.success("Welcome back");
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Login failed"));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await tokensApi.revokeCurrent();
      } catch {
        // Still clear local session if the token is already invalid.
      }
    },
    onSettled: () => {
      useAuthStore.getState().clearSession();
      queryClient.clear();
      router.replace("/login");
    },
  });
}

export function useTwoFaStatus() {
  return useQuery({
    queryKey: ["profile", "2fa", "status"],
    queryFn: authApi.twoFaStatus,
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admins", "profile"],
    queryFn: async () => {
      const data = await authApi.getProfile();
      return data.admin;
    },
  });
}

export function useActiveSessions(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["active-access-tokens", page, pageSize],
    queryFn: async () => {
      const data = await tokensApi.active({
        page,
        page_size: pageSize,
        sort_by: "created_at",
        sort_order: "desc",
      });
      return data.access_tokens;
    },
  });
}
