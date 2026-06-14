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
      {
        protocol: 'https',
        hostname: 'cataclysm.online',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/storage/v1/object/public/:path*',
        destination: 'https://kksblfpjhrkbuuvsbvcf.supabase.co/storage/v1/object/public/:path*',
      },
    ];
  },
};

export default nextConfig;