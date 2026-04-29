/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./api";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response: any = await api.get("/auth/me");
    if (response?.status === "success" && response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

export async function logoutUser(): Promise<any> {
  try {
    const response: any = await api.post("/auth/logout");

    if (response?.status === "success") {
      return response;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

export async function getMetrics(): Promise<any> {
  try {
    const response: any = await api.get("/users/stats");
    
    if (response?.status === "success" && response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("access_token=");
}

export function logout(): Promise<void> {
  return api.post("/auth/logout", {});
}
