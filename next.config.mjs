/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enhanced configuration for MediPlus health monitoring system
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
}

export default nextConfig