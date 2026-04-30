import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // async rewrites() {
  //   // In development, proxy /auth/* and /api/* to the .NET backend so that
  //   // the browser sees both on the same origin — this lets SameSite=Strict
  //   // HttpOnly cookies work without any CORS cookie headaches.
  //   //
  //   // In production you would put both behind the same domain/load-balancer
  //   // instead of using this proxy.
  //   if (process.env.NODE_ENV === "development") {
  //     return [
  //       {
  //         source: "/auth/:path*",
  //         destination: `${process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "http://localhost:5261"}/auth/:path*`,
  //       },
  //       {
  //         source: "/api/:path*",
  //         destination: `${process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "http://localhost:5261"}/api/:path*`,
  //       },
  //     ];
  //   }
  //   return [];
  // },
  // next.config.ts
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "";

    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/auth/:path*",
          destination: `${process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "http://localhost:5261"}/auth/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_INSIGHTA_API_URL ?? "http://localhost:5261"}/api/:path*`,
        },
      ];
    }

    return [
      {
        source: "/auth/:path*",
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/users/:path*",
        destination: `${backendUrl}/users/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
