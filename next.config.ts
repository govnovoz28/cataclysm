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
      {
        protocol: 'https',
        hostname: 'img.cataclysm.online',
      },
    ],
  },
};

export default nextConfig;