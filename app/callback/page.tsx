"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AuthCallback() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "Received OAuth callback with params:",
      Object.fromEntries(params.entries()),
    );

    const code = params.get("code");
    const returnedState = params.get("state");
    const storedState = sessionStorage.getItem("oauth_state");
    const storedVerifier = sessionStorage.getItem("pkce_verifier");

    if (!returnedState || returnedState !== storedState) {
      console.error("OAuth state mismatch — possible CSRF attack");
      router.replace("/");
      return;
    }

    try {
      if (!code || !storedVerifier) {
        console.error("Missing authorization code or PKCE verifier");
        router.replace("/");
        return;
      }

      const params = new URLSearchParams({
        code,
        code_verifier: storedVerifier,
        state: returnedState,
      });

      const exchangeCode = async () => {
        // const baseUrl = process.env.NEXT_PUBLIC_INSIGHTA_API_URL || "";
        // const fetchUrl = `${baseUrl}/auth/github/callback?${params.toString()}`;

        const fetchUrl = `/auth/github/callback?${params.toString()}`;
        const tokenResponse = await fetch(fetchUrl, {
          method: "GET",
          credentials: "include",
        });

        const tokenData = await tokenResponse.text();
      };

      exchangeCode().then(() => {
        router.replace("/dashboard");
      });
    } catch (error) {}
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
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}
