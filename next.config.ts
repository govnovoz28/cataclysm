// ==========================================
// next.config.ts
// ==========================================
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kksblfpjhrkbuuvsbvcf.supabase.co',
      },
    ],
  },
};

export default nextConfig;