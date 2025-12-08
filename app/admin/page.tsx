import Link from 'next/link'
import { TOTAL_PHASES } from '@/lib/config/phases'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-4xl font-serif font-bold text-primary-navy mb-8">
        관리자 대시보드
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard
          title="프롬프트 관리"
          description={`Phase 1-${TOTAL_PHASES} 프롬프트 편집 및 버전 관리`}
          href="/admin/prompts"
          icon="📝"
        />
        <AdminCard
          title="실행 결과"
          description="프롬프트 실행 결과 조회 및 비교"
          href="/admin/results"
          icon="📊"
        />
        <AdminCard
          title="성능 분석"
          description="프롬프트 성능 및 에러 분석"
          href="/admin/analytics"
          icon="📈"
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif font-semibold mb-6">빠른 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="총 프롬프트 버전" value={TOTAL_PHASES.toString()} />
          <StatCard label="실행 횟수" value="0" />
          <StatCard label="평균 실행 시간" value="-" />
          <StatCard label="성공률" value="-" />
        </div>
      </div>
    </div>
  )
}

function AdminCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link href={href} className="card-hover">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-serif font-semibold mb-2 text-primary-navy">
        {title}
      </h3>
      <p className="text-neutral-warmGray">{description}</p>
    </Link>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <p className="text-sm text-neutral-warmGray mb-2">{label}</p>
      <p className="text-3xl font-bold text-primary-crimson">{value}</p>
    </div>
  )
}
