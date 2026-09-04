import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "@/lib/types/api";

export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  if (!isApiError(error) || !error.errors) return;
  for (const [field, message] of Object.entries(error.errors)) {
    setError(field as Path<T>, { type: "server", message });
  }
}
