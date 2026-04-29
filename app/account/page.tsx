"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { getProfiles } from "../services/profiles.service";
import { FilterPopover } from "../components/Popover";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import Image from "next/image";

export type ProfileFilters = {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  country?: string;

  sortBy?: string;
  order?: "asc" | "desc";

  min_gender_probability?: number;
  max_gender_probability?: number;

  min_country_probability?: number;

  ageGroup?: string;

  page?: number;
  limit?: number;
};

export type User = {
  avatar_url: string;
  email: string;
  id: string;
  role: string;
  username: string;
};

const ITEMS_PER_PAGE = 10;

const navItems = [
  { label: "Profiles", path: "/profiles" },
  { label: "Search", path: "/search" },
];

const Account = () => {
  const router = useRouter();

  const [filters, setFilters] = React.useState<ProfileFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: "created_at",
    order: "asc",
  });

  const [draftFilters, setDraftFilters] =
    React.useState<ProfileFilters>(filters);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.replace("/");
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.replace("/");
      }
    };

    checkAuth();
  }, [router]);


  async function handleLogout() {
    try {
      const response = await logoutUser();

      if (response) {
        router.replace("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <main>
      <div className="p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 mb-8">
            <Image
              src={user?.avatar_url || "/avatar.svg"}
              alt={user?.username || "User Avatar"}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />

            <div>
              <h1 className="text-xl font-semibold leading-tight">Account</h1>
              <p className="text-zinc-600 text-sm">
                Manage your account preferences and settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* NAV */}
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="text-sm text-zinc-600 hover:text-black transition"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          {/* HEADER */}
          <div className="p-6 border-b border-zinc-200 flex items-center gap-3">
            {/* <UserIcon size={20} className="text-zinc-600" /> */}
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-6">
            {/* AVATAR + BASIC INFO */}
            <div className="flex items-center gap-4">
              <Image
                src={user?.avatar_url || "/avatar.svg"}
                alt={user?.username || "User Avatar"}
                width={56}
                height={56}
                className="rounded-full object-cover border border-zinc-200"
              />

              <div>
                <h3 className="text-lg font-semibold">{user?.username}</h3>
                <p className="text-sm text-zinc-500">{user?.role}</p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EMAIL */}
              <div className="p-4 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500 mb-1">Email</p>
                <p className="text-sm font-medium text-zinc-800">
                  {user?.email}
                </p>
              </div>

              {/* USER ID */}
              <div className="p-4 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500 mb-1">User ID</p>
                <p className="text-sm font-medium text-zinc-800 truncate">
                  {user?.id}
                </p>
              </div>

              {/* ROLE */}
              <div className="p-4 rounded-lg border border-zinc-200 md:col-span-2">
                <p className="text-xs text-zinc-500 mb-1">Role</p>
                <p className="text-sm font-medium capitalize text-zinc-800">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Account;
