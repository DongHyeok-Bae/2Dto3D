import dynamic from 'next/dynamic'
import FeatureSection from '@/components/landing/FeatureSection'
import DemoPreview from '@/components/landing/DemoPreview'
import ProcessTimeline from '@/components/landing/ProcessTimeline'
import Footer from '@/components/landing/Footer'

// Dynamic import for heavy 3D components
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-primary-navy flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Full screen with 3D building */}
      <HeroSection />

      {/* Features Section - Why 2Dto3D? */}
      <FeatureSection />

      {/* Demo Preview - Before/After comparison */}
      <DemoPreview />

      {/* Process Timeline - 5-step pipeline */}
      <ProcessTimeline />

      {/* Footer - Blueprint style */}
      <Footer />
    </main>
  )
}
