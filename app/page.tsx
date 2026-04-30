"use client";

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "@/lib/pkce";
import { GitBranch } from "lucide-react";

export default function LoginPage() {
  async function handleLogin() {
    const state = generateState();

    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      state,
    });

    window.location.href = `/auth/github?${params.toString()}`;
  }

  return (
    <main className="w-full h-screen">
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="mb-2">Welcome Back</h1>
            <p className="text-zinc-600">Sign in to continue to your account</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github"
              data-fg-mbo8="1.21:1.1088:/src/app/pages/Login.tsx:23:11:819:20:e:Github::::::t8f"
              data-fgid-mbo8=":r6:"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
            <span>Continue with GitHub</span>
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </main>
  );
}
