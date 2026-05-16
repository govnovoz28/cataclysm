// ==========================================
// next.config.ts
// ==========================================
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kksblfpjhrkbuuvsbvcf.supabase.co',
      },
    ],
  },
};

export default nextConfig;
