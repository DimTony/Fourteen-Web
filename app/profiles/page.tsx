"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
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
  { label: "Search", path: "/search" },
  { label: "Account", path: "/account" },
];

const pageSizeOptions = [10, 20, 50, 100];

const Profiles = () => {
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

  useEffect(() => {
    const searchProfiles = async () => {
      setIsLoading(true);
      try {
        const data = await getProfiles(filters);
        setProfiles(data.data);
        if (data.total !== undefined) {
          setTotalCount(data.total);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchProfiles();
  }, [filters]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setFilters((prev) => ({ ...prev, page: currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setFilters((prev) => ({ ...prev, page: currentPage + 1 }));
    }
  };

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({
      ...prev,
      limit: size,
      page: 1,
    }));
  };

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
              <h1 className="text-xl font-semibold leading-tight">Profiles</h1>
              <p className="text-zinc-600 text-sm">
                Manage and view all user profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            
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

            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex flex-col md:flex-row md:justify-end gap-4">
              <FilterPopover
                draftFilters={draftFilters}
                setDraftFilters={setDraftFilters}
                onApply={(newFilters: any) => {
                  setFilters({
                    ...newFilters,
                    page: 1,
                  });
                }}
              />
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Gender Probability
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Age Group
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-zinc-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-8 text-center text-zinc-500"
                      >
                        Loading profiles...
                      </td>
                    </tr>
                  ) : profiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-8 text-center text-zinc-500"
                      >
                        No profiles found.
                      </td>
                    </tr>
                  ) : (
                    profiles.map((profile: any) => (
                      <tr
                        key={profile.id}
                        className="hover:bg-zinc-50 transition-colors"
                      >
                        <td className="px-6 py-4">{profile.name}</td>
                        <td className="px-6 py-4 capitalize">
                          {profile.gender}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {(profile.gender_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4">{profile.age}</td>
                        <td className="px-6 py-4 capitalize">
                          {profile.age_group}
                        </td>
                        <td className="px-6 py-4">
                          {profile.country_name} ({profile.country_id})
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {(profile.country_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/profiles/${profile.id}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              Page {currentPage} of {totalPages}
              {totalCount > 0 && ` · ${totalCount} total profiles`}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600">Rows per page</span>

              <select
                value={filters.limit}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 border border-zinc-300 rounded-lg text-sm"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
                className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profiles;
