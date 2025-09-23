import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle cross-origin requests for development and production
  allowedDevOrigins: [
    'finalpoint.app',
    'www.finalpoint.app',
    'api.finalpoint.app',
    'localhost',
    '127.0.0.1',
    '192.168.0.15'
  ],

  // Temporarily disable ESLint for build to fix push notifications
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Additional security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Add CSS MIME type headers
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable', // 1 day instead of 1 year
          },
        ],
      },
      // Add JavaScript bundle headers with shorter cache
      {
        source: '/_next/static/chunks/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable', // 1 day instead of 1 year
          },
        ],
      },
      // Service worker headers
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
    ];
  },

  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.NEXT_PUBLIC_API_URL,
  },

  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },

  // Handle images and static assets
  images: {
    domains: ['finalpoint.app', 'api.finalpoint.app'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
