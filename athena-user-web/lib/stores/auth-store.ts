import { create } from "zustand";

export type PendingFlow = "register" | "login-otp" | "recover";

interface PendingOtp {
  flow: PendingFlow;
  key: string;
  timeoutSeconds?: number;
}

interface AuthState {
  accessToken: string | null;
  isHydrated: boolean;
  loginKey: string | null;
  pendingOtp: PendingOtp | null;
  setAccessToken: (token: string | null) => void;
  setHydrated: (value: boolean) => void;
  setLoginKey: (key: string | null) => void;
  setPendingOtp: (pending: PendingOtp | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isHydrated: false,
  loginKey: null,
  pendingOtp: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setHydrated: (value) => set({ isHydrated: value }),
  setLoginKey: (key) => set({ loginKey: key }),
  setPendingOtp: (pending) => set({ pendingOtp: pending }),
  clearSession: () =>
    set({
      accessToken: null,
      loginKey: null,
      pendingOtp: null,
    }),
}));
