import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for better performance and server features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@clerk/nextjs'],
  },
  // Enable SWC minification for better performance
  swcMinify: true,
  // Optimize images
  images: {
    domains: ['img.clerk.com'], // Add Clerk's image domain
    formats: ['image/webp', 'image/avif'],
  },
  // Enable gzip compression
  compress: true,
  // Optimize JavaScript
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
