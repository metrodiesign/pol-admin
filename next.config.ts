import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "api-prod-minimal-v700.pages.dev",
      },
    ],
  },
};

export default nextConfig;
