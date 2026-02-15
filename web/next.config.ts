import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // cacheComponentsは無効（動的OGPとの互換性のため）
  // cacheComponents: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Allow local development with Supabase
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
}

export default nextConfig
