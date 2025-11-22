import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="min-h-screen laurel-pattern">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logo-crossover.png"
                alt="2Dto3D Logo"
                width={400}
                height={200}
                priority
                className="drop-shadow-neo-lg"
              />
            </div>

            {/* Title */}
            <h1 className="text-6xl font-serif font-bold mb-6">
              <span className="text-gradient-royal">2Dto3D</span>
            </h1>

            <p className="text-xl text-neutral-warmGray mb-4">
              BIM-AutoConverter v3.0
            </p>

            <p className="text-lg text-neutral-charcoal/80 max-w-2xl mx-auto mb-12">
              파편화된 2D 도면을 AI가 이해하고, 사용자와 대화를 통해<br />
              실시간 3D 모델을 조립하며, 정보가 살아있는 BIM 데이터를 생성하는<br />
              <span className="font-semibold text-primary-crimson">지능형 웹 서비스</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <Link href="/upload" className="btn-primary">
                시작하기
              </Link>
              <Link href="/admin/prompts" className="btn-secondary">
                관리자 페이지
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="⚡"
            title="시간 단축"
            description="수일 → 몇 분"
          />
          <FeatureCard
            icon="🎯"
            title="정확성"
            description="벡터 기반 정밀 변환"
          />
          <FeatureCard
            icon="📊"
            title="데이터화"
            description="BIM 정보 포함"
          />
          <FeatureCard
            icon="🔄"
            title="동적 상호작용"
            description="실시간 수정 가능"
          />
        </div>
      </div>

      {/* Process Flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif font-bold text-center mb-12">
          변환 프로세스
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <ProcessStep number={1} title="도면 업로드" />
          <Arrow />
          <ProcessStep number={2} title="AI 분석" />
          <Arrow />
          <ProcessStep number={3} title="검증" />
          <Arrow />
          <ProcessStep number={4} title="3D 생성" />
          <Arrow />
          <ProcessStep number={5} title="내보내기" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-navy text-white py-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm opacity-80">
            © 2024 2Dto3D. Powered by Google Gemini AI & Vercel.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card-hover text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-serif font-semibold mb-2 text-primary-navy">{title}</h3>
      <p className="text-neutral-warmGray text-sm">{description}</p>
    </div>
  )
}

function ProcessStep({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-royal flex items-center justify-center text-white font-bold text-xl mb-2">
        {number}
      </div>
      <p className="text-sm font-medium text-neutral-charcoal">{title}</p>
    </div>
  )
}

function Arrow() {
  return (
    <div className="hidden md:block text-primary-gold text-2xl">→</div>
  )
}
