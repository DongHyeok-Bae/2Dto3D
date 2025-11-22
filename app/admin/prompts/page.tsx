import Link from 'next/link'

const PHASES = [
  { number: 1, name: 'Normalization', description: '좌표계 설정' },
  { number: 2, name: 'Structure', description: '구조 추출' },
  { number: 3, name: 'Openings', description: '개구부 인식' },
  { number: 4, name: 'Spaces', description: '공간 분석' },
  { number: 5, name: 'Dimensions', description: '치수 계산' },
  { number: 6, name: 'Confidence', description: '신뢰도 검증' },
  { number: 7, name: 'Master JSON', description: '최종 합성' },
]

export default function PromptsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-primary-navy">
          프롬프트 관리
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PHASES.map(phase => (
          <Link
            key={phase.number}
            href={`/admin/prompts/phase${phase.number}`}
            className="card-hover"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-royal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {phase.number}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-semibold mb-1 text-primary-navy">
                  Phase {phase.number}: {phase.name}
                </h3>
                <p className="text-sm text-neutral-warmGray">{phase.description}</p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-accent-emerald/10 text-accent-emerald text-xs rounded">
                    활성
                  </span>
                  <span className="px-2 py-1 bg-neutral-warmGray/10 text-neutral-warmGray text-xs rounded">
                    v1.0.0
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
