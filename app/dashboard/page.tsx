"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, getMetrics, logoutUser } from "@/lib/auth";
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

export type Metric = {
  label: string;
  value: string | number;
  change: string;
  color: string;
  icon: string;
};

const navItems = [
  { label: "Profiles", path: "/profiles" },
  { label: "Search", path: "/search" },
  { label: "Account", path: "/account" },
];

const Dashboard = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);

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
    const fetchMetrics = async () => {
      try {
        const userMetrics = await getMetrics();

        if (userMetrics) {
          setMetrics(userMetrics);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

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
    <main className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/account")}>
            <Image
              src={user?.avatar_url || "/avatar.svg"}
              alt={user?.username || "User Avatar"}
              width={44}
              height={44}
              className="rounded-full object-cover cursor-pointer hover:opacity-80 transition"
            />
          </button>

          <div>
            <h1 className="text-xl font-semibold leading-tight">Dashboard</h1>
            <p className="text-zinc-600 text-sm">
              Welcome back {user?.username || ""}! Here's what's happening
              today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`text-white p-3 rounded-lg ${metric.color}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-users"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="text-sm text-green-600">
                {metric.change || "..."}
              </span>
            </div>
            <p className="text-zinc-600 text-sm mb-1">
              {metric.label || "..."}
            </p>
            <p className="font-semibold">{metric.value || "..."}</p>
          </div>
        ))}
      </div>

      <nav className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl my-8">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
          px-4 py-2 rounded-lg text-sm font-medium transition
          ${
            isActive
              ? "bg-white text-black shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-zinc-200"
          }
        `}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </main>
  );
};

export default Dashboard;
