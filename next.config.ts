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
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'kksblfpjhrkbuuvsbvcf.supabase.co',
      },
    ],
  },
  async redirects() {
    return[
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'cataclysm.online' }],
        destination: 'https://www.cataclysm.online/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;