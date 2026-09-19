import { isApiError } from "@/lib/types/api";

export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (isApiError(error)) {
    const fieldErrors = error.errors
      ? Object.values(error.errors).filter(Boolean).join(" ")
      : "";
    const combined = [error.message, fieldErrors].filter(Boolean).join(" — ");
    if (error.statusCode === 403 && !combined) {
      return "You don't have permission for this.";
    }
    return combined || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function QueryError({
  error,
  fallback = "Could not load this page.",
}: {
  error: unknown;
  fallback?: string;
}) {
  const forbidden = isApiError(error) && error.statusCode === 403;
  return (
    <div
      className={
        forbidden
          ? "rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
          : "rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      }
    >
      <p className="font-medium">{forbidden ? "Permission required" : "Request failed"}</p>
      <p className="mt-1">{errorMessage(error, fallback)}</p>
    </div>
  );
}
