import { api } from "@/lib/api";

export interface Profile {
  id: string;
  name: string;
  gender?: string;
  [key: string]: any;
}

export async function getProfile(id: string): Promise<Profile> {
  return await api.get(`/api/profiles/${id}`);
}

export async function createProfile(data: { name: string }): Promise<Profile> {
  return await api.post("/api/profiles", data);
}

export async function getProfiles(filters?: {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
  gender?: string;
}): Promise<{ data: Profile[]; total: number; page: number }> {
  const queryParams = new URLSearchParams();
  if (filters) {
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by);
    if (filters.order) queryParams.append("order", filters.order);
    if (filters.gender) queryParams.append("gender", filters.gender);
  }

  const url = `/api/profiles${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
  return await api.get(url);
}

export async function searchProfiles(filters: { query: string, sort_by?: string, order?: "asc" | "desc" }): Promise<Profile[]> {
  const queryParams = new URLSearchParams();
  if (filters.query) queryParams.append("q", filters.query);
  if (filters.sort_by) queryParams.append("sort_by", filters.sort_by);
  if (filters.order) queryParams.append("order", filters.order);

  const url = `/api/profiles/search${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
  return await api.get(url);
}
