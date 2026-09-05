"use client";

import { useQuery } from "@tanstack/react-query";
import { blockchainsApi } from "@/lib/api/blockchains";

export function useBlockchains() {
  return useQuery({
    queryKey: ["blockchains"],
    queryFn: blockchainsApi.list,
    staleTime: 60_000,
  });
}
