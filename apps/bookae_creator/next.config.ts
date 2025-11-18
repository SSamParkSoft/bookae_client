import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // better-sqlite3는 서버 사이드에서만 사용 (Turbopack 호환)
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
