"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, User } from "@/lib/auth";

export function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: User }>,
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function checkAuth() {
        try {
          // Check if access token cookie exists
          console.log(document.cookie);

          
          const hasToken =
            typeof document !== "undefined" &&
            document.cookie.includes("access_token=");

          if (!hasToken) {
            router.replace("/");
            return;
          }

          // Fetch current user
          const currentUser = await getCurrentUser();

          if (!currentUser) {
            router.replace("/");
            return;
          }

          setUser(currentUser);
        } catch (err) {
          console.error("Auth check failed:", err);
          setError("Authentication failed");
          router.replace("/");
        } finally {
          setIsLoading(false);
        }
      }

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="w-8 h-8 border-4 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} user={user} />;
  };
}
