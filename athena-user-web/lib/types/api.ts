export interface ApiResponse<T = Record<string, unknown>> {
  is_successful: boolean;
  request_uuid: string;
  request_ip: string;
  status_code: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  error_code?: number;
}

export interface Paginated<T> {
  page_size: number;
  current_page: number;
  total_pages: number;
  total_items: number;
  items: T[];
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  global_search?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string>;
  errorCode?: number;
  requestUuid?: string;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      errors?: Record<string, string>;
      errorCode?: number;
      requestUuid?: string;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = options.statusCode ?? 0;
    this.errors = options.errors;
    this.errorCode = options.errorCode;
    this.requestUuid = options.requestUuid;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
