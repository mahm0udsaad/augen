/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Production fix: if the image optimizer endpoint is blocked (e.g. returning 402),
    // bypass Next.js optimization and load remote images directly.
    // This prevents requests to `/_next/image?...` in production.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'gjqrphudfyxkkpvoohxj.supabase.co',
      },
    ],
    // Keep qualities in sync with usage across the app to avoid Next/Image warnings
    qualities: [60, 75, 80, 85, 90],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
}

export default nextConfig
