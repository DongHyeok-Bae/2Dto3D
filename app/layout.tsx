import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import './globals.css'

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
  description: 'BIM-AutoConverter v3.0 - Google Gemini AI를 활용한 2D 건축 도면의 실시간 3D BIM 모델 변환 서비스. 경희대학교 건축학과와 함께하는 혁신적인 건축 설계 도구',
  keywords: ['BIM', '3D 변환', '건축 도면', '2D to 3D', 'AI 건축', 'Google Gemini', '경희대학교', 'Three.js', 'WebGL', '건축 설계', 'CAD 변환', 'IFC', 'glTF'],
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
    description: 'Google Gemini AI를 활용하여 2D 건축 도면을 실시간으로 3D BIM 모델로 변환하는 혁신적인 웹 서비스',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <body className="bg-neutral-marble text-neutral-charcoal font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
