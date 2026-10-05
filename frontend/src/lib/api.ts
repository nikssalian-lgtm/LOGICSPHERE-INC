export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
};
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD"].includes(method)) {
    const csrf = await fetch("/sanctum/csrf-cookie", {
      credentials: "include",
      signal: AbortSignal.timeout(20_000),
      headers: { Accept: "application/json" },
    }).catch(() => {
      throw new ApiError(
        0,
        "Unable to establish a secure connection. Please try again.",
      );
    });
    if (!csrf.ok)
      throw new ApiError(
        csrf.status,
        "Unable to establish a secure session. Please try again.",
      );
  }
  const token =
    typeof document === "undefined"
      ? undefined
      : document.cookie
          .split("; ")
          .find((c) => c.startsWith("XSRF-TOKEN="))
          ?.slice(11);
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...options,
      credentials: "include",
      cache: "no-store",
      signal: options.signal ?? AbortSignal.timeout(20_000),
      headers: {
        Accept: "application/json",
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { "X-XSRF-TOKEN": decodeURIComponent(token) } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the server. Check your connection and try again.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      response.status,
      payload.message ?? "Something went wrong. Please try again.",
      payload.errors,
    );
  return payload as T;
}
