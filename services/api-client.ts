import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Absolute URL or path relative to the app origin. */
  baseUrl?: string;
};

/**
 * Thin typed fetch wrapper for calling VaultDrop's own route handlers/services.
 * Serializes JSON, throws a typed ApiError on non-2xx, and parses JSON out.
 */
async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, baseUrl, headers, ...rest } = options;
  const origin = baseUrl ?? env.NEXT_PUBLIC_APP_URL;
  const url = path.startsWith("http") ? path : `${origin}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (payload as { message?: string })?.message ?? res.statusText,
      payload,
    );
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
