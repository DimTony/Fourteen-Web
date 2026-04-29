/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCsrfToken } from "./csrf";

const BASE_URL = process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_INSIGHTA_API_VERSION ?? "1";

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

/**
 * Core request function with automatic token refresh on 401
 */
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

  // Add CSRF token for state-changing requests
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

  // Add CSRF token for state-changing requests
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
    // Attempt to refresh token using cookies
    await refreshTokenWithCookies();

    // Retry original request once with new token
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
  console.error("\n✗ Session expired. Please login to authenticate again.\n");
  // Redirect to login page
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

// const client = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, // replaces credentials: "include"
//   headers: {
//     "Content-Type": "application/json",
//     "X-API-Version": API_VERSION,
//   },
// });

// // ─── Request interceptor ───────────────────────────────────────────────────────
// client.interceptors.request.use((config) => {
//   const method = (config.method ?? "get").toUpperCase();
//   const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

//   if (mutating) {
//     const csrf = getCsrfToken();
//     if (!csrf) throw new Error("CSRF token missing");
//     config.headers["X-CSRF-Token"] = csrf;
//   }

//   console.groupCollapsed(`🚀 API Request: ${method} ${config.baseURL}${config.url}`);
//   console.log("Headers:", config.headers);
//   console.log("Params:", config.params);
//   console.log("Body:", config.data);
//   console.groupEnd();

//   return config;
// });

// // ─── Response interceptor ──────────────────────────────────────────────────────
// client.interceptors.response.use(
//   (response) => {
//     const { config, status, data } = response;
//     const method = (config.method ?? "get").toUpperCase();

//     console.groupCollapsed(`📦 API Response: ${method} ${config.baseURL}${config.url}`);
//     console.log("Status:", status);
//     console.log("Data:", data);
//     console.groupEnd();

//     return response;
//   },
//   (error: AxiosError) => {
//     const config = error.config;
//     const method = (config?.method ?? "get").toUpperCase();
//     const url = `${config?.baseURL}${config?.url}`;

//     if (error.response) {
//       // Server responded with a non-2xx status
//       console.error(`❌ API Error [${error.response.status}]: ${method} ${url}`, {
//         status: error.response.status,
//         data: error.response.data,
//         headers: error.response.headers,
//       });
//     } else if (error.request) {
//       // Request was made but no response received — CORS, server down, etc.
//       console.error(`❌ No response received: ${method} ${url}`, {
//         message: error.message,
//         // This will now say something like "Network Error" or "CORS" instead of "Failed to fetch"
//         code: error.code,
//         request: error.request,
//       });
//     } else {
//       // Error setting up the request
//       console.error(`❌ Request setup error: ${method} ${url}`, error.message);
//     }

//     return Promise.reject(error);
//   },
// );

// // ─── Core request wrapper ──────────────────────────────────────────────────────
// export async function apiRequest<T>(
//   path: string,
//   config: AxiosRequestConfig = {},
// ): Promise<T> {
//   const response = await client.request<T>({ url: path, ...config });
//   return response.data;
// }

// // ─── Types & helpers ───────────────────────────────────────────────────────────
// export type ProfileFilters = {
//   gender?: string;
//   age_group?: string;
//   country_id?: string;
//   min_age?: number;
//   max_age?: number;
//   min_gender_probability?: number;
//   max_gender_probability?: number;
//   min_country_probability?: number;
//   sort_by?: string;
//   order?: "asc" | "desc";
//   page?: number;
//   limit?: number;
// };

// export async function fetchProfiles(filters: ProfileFilters) {
//   // Pass filters as `params` — axios serializes them as query string automatically
//   return apiRequest<unknown>("/api/profiles", { params: filters });
// }

// import { getCsrfToken } from "./csrf";

// const BASE_URL =
//   process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "http://localhost:5000";
// const API_VERSION = process.env.NEXT_PUBLIC_INSIGHTA_API_VERSION ?? "1";

// export async function apiRequest<T>(
//   path: string,
//   init: RequestInit = {},
// ): Promise<T> {
//   const method = (init.method ?? "GET").toUpperCase();
//   const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     "X-API-Version": API_VERSION,
//     ...(init.headers as Record<string, string>),
//   };

//   if (mutating) {
//     const csrf = getCsrfToken();
//     if (!csrf) throw new Error("CSRF token missing");
//     headers["X-CSRF-Token"] = csrf;
//   }

//   const url = `${BASE_URL}${path}`;

//   // 🔍 REQUEST LOG
//   console.groupCollapsed(`🚀 API Request: ${method} ${url}`);
//   console.log("Headers:", headers);
//   console.log("Body:", init.body);
//   console.log("Options:", init);
//   console.groupEnd();

//   try {
//     const res = await fetch(url, {
//       ...init,
//       method,
//       headers,
//       credentials: "include",
//     });

//     const text = await res.text(); // read once

//     // 🔍 RESPONSE LOG
//     console.groupCollapsed(`📦 API Response: ${method} ${url}`);
//     console.log("Status:", res.status);
//     console.log("Response body:", text);
//     console.groupEnd();

//     if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

//     return JSON.parse(text);
//   } catch (err) {
//     // 🔍 ERROR LOG
//     console.error(`❌ API Error: ${method} ${url}`, err);
//     throw err;
//   }
// }

// export type ProfileFilters = {
//   gender?: string;
//   age_group?: string;
//   country_id?: string;
//   min_age?: number;
//   max_age?: number;
//   min_gender_probability?: number;
//   max_gender_probability?: number;
//   min_country_probability?: number;
//   sort_by?: string;
//   order?: "asc" | "desc";
//   page?: number;
//   limit?: number;
// };

// function buildQuery(params: ProfileFilters) {
//   const search = new URLSearchParams();

//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       search.append(key, String(value));
//     }
//   });

//   return search.toString();
// }

// export async function fetchProfiles(filters: ProfileFilters) {
//   const query = buildQuery(filters);

//   return apiRequest(`/api/profiles?${query}`);
// }
