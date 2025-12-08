import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import VisitTracker from '@/components/analytics/VisitTracker'

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://2dto3d.vercel.app'),
  title: {
    default: '2Dto3D - AI 기반 건축 도면 3D BIM 변환 서비스',
    template: '%s | 2Dto3D'
  },
  description: 'BIM-AutoConverter - AI를 활용한 2D 건축 도면의 실시간 3D BIM 모델 변환 서비스. (feat.경희대학교 건축공학과)',
  keywords: ['BIM', '3D 변환', '건축 도면', '2D to 3D', '건축 도면 변환', 'AI 건축', '경희대학교', 'Three.js', 'WebGL', 'CAD 변환', 'IFC', 'glTF', '투디투쓰리디'],
  authors: [
    { name: '경희대학교 건축학과' },
    { name: '2Dto3D Team' }
  ],
  creator: '2Dto3D Team',
  publisher: '경희대학교',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    // 파일 기반 메타데이터: app/favicon.ico, app/icon.png, app/apple-icon.png 자동 인식
    // PWA용 추가 아이콘만 명시적으로 설정
    icon: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo-crossover.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '2Dto3D - 경희대학교',
    title: '2Dto3D - AI 기반 건축 도면 3D BIM 변환 서비스',
    description: 'AI를 활용하여 2D 건축 도면을 실시간으로 3D BIM 모델로 변환하는 혁신적인 웹 서비스',
    images: [
      {
        url: '/logo-crossover.png',
        width: 1200,
        height: 630,
        alt: '2Dto3D × 경희대학교',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2Dto3D - AI 기반 건축 도면 3D 변환',
    description: '2D 건축 도면을 실시간 3D BIM 모델로 변환',
    images: ['/logo-crossover.png'],
    creator: '@kyunghee',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/ko',
      'en-US': '/en',
    },
  },
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#9A212D' },
    { media: '(prefers-color-scheme: dark)', color: '#1A2B50' },
  ],
}

// Google 검색 결과 로고를 위한 JSON-LD 구조화된 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '2Dto3D',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://2dto3d.vercel.app',
  logo: {
    '@type': 'ImageObject',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://2dto3d.vercel.app'}/logo-crossover.png`,
    width: 1200,
    height: 630,
  },
  description: 'AI를 활용한 2D 건축 도면의 실시간 3D BIM 모델 변환 서비스',
  founder: {
    '@type': 'Organization',
    name: '경희대학교 건축공학과',
  },
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '2Dto3D',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://2dto3d.vercel.app',
  description: 'AI 기반 건축 도면 3D BIM 변환 서비스',
  publisher: {
    '@type': 'Organization',
    name: '2Dto3D',
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://2dto3d.vercel.app'}/logo-crossover.png`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-neutral-marble text-neutral-charcoal font-sans antialiased">
        <VisitTracker />
        {children}
      </body>
    </html>
  )
}
