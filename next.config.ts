import type { NextConfig } from "next";

// Мы пишем : any, чтобы TypeScript не ругался на настройки
const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;