import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimized breakpoints for hero image
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller sizes for icons/avatars
  },
  // Compress responses
  compress: true,
  // Enable production source maps for debugging (optional, remove if not needed)
  productionBrowserSourceMaps: false,
  // Power user performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
};

export default nextConfig;
