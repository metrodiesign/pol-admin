import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

// dev: ตั้ง ADMIN_API_ORIGIN=https://localhost:5001 ให้ proxy /admin/* + /producer/* ไป BFF เดียวกัน
// (producer-google-sso.md §18.4 — producer endpoints อยู่ API host เดียวกับ admin) — บังคับ same-origin.
// prod: เว้นว่าง — reverse proxy เสิร์ฟ SPA + API เป็น origin เดียวกันอยู่แล้ว ไม่ต้อง rewrite.
const adminApiOrigin = process.env.ADMIN_API_ORIGIN;
const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  agentRules: false,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: ["@pol/ui", "@pol/shared"],
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
  async rewrites() {
    if (!adminApiOrigin) return [];
    return [
      { source: "/admin/:path*", destination: `${adminApiOrigin}/api/v1/admins/:path*` },
      { source: "/producer/:path*", destination: `${adminApiOrigin}/api/v1/merchants/:path*` },
      // master data โครงสร้างองค์กร (offices/divisions/positions/levels) อยู่ /api/v1 top-level
      // ไม่เข้า 2 rule บน — passthrough ทั้ง /api ได้เพราะ src/app ไม่มี route ใต้ /api
      { source: "/api/:path*", destination: `${adminApiOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
