import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError, type ApiResponse } from "@/lib/types/api";
import type { JwtDTO } from "@/lib/types/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

const SKIP_REFRESH_PATHS = [
  "/authentication/login",
  "/authentication/recover-password",
  "/access-tokens/refresh",
];

function shouldSkipRefresh(url?: string) {
  if (!url) return false;
  return SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse | undefined;
    if (body?.message) {
      return new ApiError(humanizeMessage(body.message), {
        statusCode: body.status_code || error.response?.status || 0,
        errors: body.errors,
        errorCode: body.error_code,
        requestUuid: body.request_uuid,
      });
    }

    if (!error.response) {
      return new ApiError(
        "Cannot reach the Athena Admin API. If the backend uses a self-signed certificate, open https://localhost:8081 in this browser once and accept the certificate, then retry.",
        { statusCode: 0 },
      );
    }

    return new ApiError(error.message, {
      statusCode: error.response.status,
    });
  }

  return new ApiError("Something went wrong. Please try again.");
}

function humanizeMessage(message: string) {
  return message.replace(/-/g, " ");
}

let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(instance: AxiosInstance): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = instance
    .post<ApiResponse<{ access_tokens: JwtDTO }>>(
      "/access-tokens/refresh",
      {},
      { _skipAuthRefresh: true } as AxiosRequestConfig,
    )
    .then((response) => {
      const token = response.data.data?.access_tokens?.access_token_string;
      if (!response.data.is_successful || !token) return null;
      useAuthStore.getState().setAccessToken(token);
      return token;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function redirectToLogin() {
  useAuthStore.getState().clearSession();
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  if (window.location.pathname.startsWith("/recover-password")) return;
  if (window.location.pathname.startsWith("/two-fa")) return;
  window.location.href = "/login";
}

function createClient() {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:8081/api/v1",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
      const original = error.config;
      if (!original || original._skipAuthRefresh || shouldSkipRefresh(original.url)) {
        return Promise.reject(error);
      }

      if (error.response?.status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      original._retry = true;
      const token = await silentRefresh(instance);
      if (!token) {
        redirectToLogin();
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${token}`;
      return instance(original);
    },
  );

  return instance;
}

const axiosClient = createClient();

async function unwrap<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  try {
    const response = await request;
    const body = response.data;

    if (!body.is_successful) {
      throw new ApiError(humanizeMessage(body.message || "Request failed"), {
        statusCode: body.status_code || response.status,
        errors: body.errors,
        errorCode: body.error_code,
        requestUuid: body.request_uuid,
      });
    }

    return (body.data ?? {}) as T;
  } catch (error) {
    throw toApiError(error);
  }
}

export const apiClient = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(axiosClient.get<ApiResponse<T>>(url, config));
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(axiosClient.post<ApiResponse<T>>(url, data ?? {}, config));
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(axiosClient.put<ApiResponse<T>>(url, data ?? {}, config));
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(
      axiosClient.patch<ApiResponse<T>>(url, data ?? {}, config),
    );
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(axiosClient.delete<ApiResponse<T>>(url, config));
  },
};

export async function bootstrapSession() {
  const token = await silentRefresh(axiosClient);
  useAuthStore.getState().setHydrated(true);
  return token;
}

export { axiosClient, silentRefresh };
