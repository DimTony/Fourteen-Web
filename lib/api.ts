import { getCsrfToken } from "./csrf";

const BASE_URL = process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_INSIGHTA_API_VERSION ?? "1";

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    ...(options.headers as Record<string, string>),
  };

  const method = options.method?.toUpperCase() || "GET";
  if (
    method === "POST" ||
    method === "PUT" ||
    method === "DELETE" ||
    method === "PATCH"
  ) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  if (response.status === 401 && retry) {
    return handle401<T>(path, options);
  }

  const errorBody = await safeJson(response);
  throw new Error(
    errorBody?.message || `Request failed with status ${response.status}`,
  );
}

async function requestText(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    ...(options.headers as Record<string, string>),
  };

  const method = options.method?.toUpperCase() || "GET";
  if (
    method === "POST" ||
    method === "PUT" ||
    method === "DELETE" ||
    method === "PATCH"
  ) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.ok) {
    return response.text();
  }

  if (response.status === 401 && retry) {
    return requestText(path, options, false);
  }

  const errorBody = await safeJson(response);
  throw new Error(
    errorBody?.message || `Request failed with status ${response.status}`,
  );
}

async function handle401<T>(path: string, options: RequestInit): Promise<T> {
  try {
    await refreshTokenWithCookies();

    return request<T>(path, options, false);
  } catch (error) {
    promptRelogin();
    throw new Error("Session expired. Please login again.");
  }
}

async function refreshTokenWithCookies() {
  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Version": API_VERSION,
      },
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Refresh failed: ${error}`);
        }
        return res.json();
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
  }

  return refreshPromise!;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function promptRelogin(): void {
  console.error("\nSession expired. Please login to authenticate again.\n");
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  getText: (path: string) => requestText(path),

  post: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  put: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body ?? {}),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
