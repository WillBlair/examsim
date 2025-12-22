import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },
  experimental: {
    // Optimize CSS to reduce render-blocking resources
    optimizeCss: true,
  },
};

export default nextConfig;
