/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 이미지 최적화
  images: {
    domains: ['localhost', '2dto3d.vercel.app'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // 실험적 기능
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // optimizeCss: true, // critters 의존성 문제로 비활성화
    optimizePackageImports: [
      '@react-three/fiber',
      '@react-three/drei',
      'three',
      '@monaco-editor/react',
      'zustand',
    ],
  },

  // 압축
  compress: true,

  // 파워 최적화
  poweredByHeader: false,

  // 웹팩 최적화
  webpack: (config, { isServer }) => {
    // Path alias 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }

    // Three.js 최적화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    // 번들 분석 (필요시 주석 해제)
    // if (process.env.ANALYZE === 'true') {
    //   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    //   config.plugins.push(new BundleAnalyzerPlugin())
    // }

    return config
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // 정적 자원 캐싱
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 폰트 캐싱
      {
        source: '/:all*(woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/service',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
