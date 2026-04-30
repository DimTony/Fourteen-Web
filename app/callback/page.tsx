"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AuthCallback() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const returnedState = params.get("state");
    const storedState = sessionStorage.getItem("oauth_state");

    if (!returnedState || returnedState !== storedState) {
      console.error("OAuth state mismatch — possible CSRF attack");
      router.replace("/");
      return;
    }

    router.replace("/dashboard");
  }, [params, router]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin" />

        <p className="text-white text-sm tracking-wide">Logging in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin" />

            <p className="text-white text-sm tracking-wide">Logging in…</p>
          </div>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
