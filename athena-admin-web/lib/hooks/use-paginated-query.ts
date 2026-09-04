"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Paginated, PaginationParams } from "@/lib/types/api";

export function usePaginatedQuery<T>(
  queryKey: readonly unknown[],
  fetcher: (params: PaginationParams) => Promise<Paginated<T>>,
  params: PaginationParams,
  options?: Omit<UseQueryOptions<Paginated<T>>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetcher(params),
    ...options,
  });
}
