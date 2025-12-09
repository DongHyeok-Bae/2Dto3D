'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AlgorithmicArtCanvasProps {
  currentPhase: number
  totalPhases: number
  isRunning: boolean
  confidenceScores?: Record<number, number>
}

// 건물 파트 정의
interface BuildingPart {
  id: string
  points: { x: number; y: number }[]
  phase: number
  type: 'wall' | 'floor' | 'window' | 'door' | 'roof'
  delay: number
}

// Phase별 파티클 인터페이스
interface PhaseParticle {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  color: string
  size: number
  life: number
  pattern: string
  angle?: number
}

// Phase별 스타일 설정
const PHASE_STYLES: Record<number, {
  name: string
  strokeStyle: 'dashed' | 'solid'
  strokeWidth: number
  opacity: number
  fillOpacity: number
  particleColor: string
  particleSpeed: number
  particleCount: number
  glowIntensity: number
  showGrid?: boolean
  highlightOpenings?: boolean
  enable3DRotation?: boolean
  showZones?: boolean
  showDimensions?: boolean
  celebrationEffect?: boolean
}> = {
  1: {
    name: '좌표계 분석',
    strokeStyle: 'dashed',
    strokeWidth: 1.5,
    opacity: 0.6,
    fillOpacity: 0.1,
    particleColor: '#C5A059',
    particleSpeed: 0.02,
    particleCount: 2,
    glowIntensity: 0,
    showGrid: true,
  },
  2: {
    name: '구조 분석',
    strokeStyle: 'solid',
    strokeWidth: 2.5,
    opacity: 0.85,
    fillOpacity: 0.15,
    particleColor: '#1A2B50',
    particleSpeed: 0.04,
    particleCount: 3,
    glowIntensity: 2,
    showGrid: true,
  },
  3: {
    name: '개구부 탐지',
    strokeStyle: 'solid',
    strokeWidth: 3,
    opacity: 1,
    fillOpacity: 0.25,
    particleColor: '#9A212D',
    particleSpeed: 0.05,
    particleCount: 4,
    glowIntensity: 4,
    showGrid: false,
    highlightOpenings: true,
  },
  4: {
    name: '공간 분석',
    strokeStyle: 'solid',
    strokeWidth: 3,
    opacity: 1,
    fillOpacity: 0.3,
    particleColor: '#00A86B',
    particleSpeed: 0.06,
    particleCount: 5,
    glowIntensity: 5,
    showGrid: false,
    enable3DRotation: true,
    showZones: true,
  },
  5: {
    name: '치수 정보',
    strokeStyle: 'solid',
    strokeWidth: 3.5,
    opacity: 1,
    fillOpacity: 0.35,
    particleColor: '#C5A059',
    particleSpeed: 0.04,
    particleCount: 4,
    glowIntensity: 4,
    showDimensions: true,
  },
  6: {
    name: '최종 통합',
    strokeStyle: 'solid',
    strokeWidth: 4,
    opacity: 1,
    fillOpacity: 0.4,
    particleColor: '#FFD700',
    particleSpeed: 0.03,
    particleCount: 8,
    glowIntensity: 8,
    celebrationEffect: true,
  }
}

// Phase별 색상
const PHASE_COLORS: Record<number, string> = {
  1: '#C5A059',
  2: '#1A2B50',
  3: '#9A212D',
  4: '#00A86B',
  5: '#0066CC',
  6: '#FFD700',
}

// Phase 완료 축하 효과 컴포넌트
const PhaseCompletionBurst = ({ phase, x, y }: { phase: number; x: number; y: number }) => {
  const color = PHASE_COLORS[phase] || '#C5A059'

  return (
    <motion.g>
      {/* 방사형 파티클 폭발 */}
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={4}
          fill={color}
          initial={{ opacity: 1 }}
          animate={{
            cx: x + Math.cos(i * 45 * Math.PI / 180) * 80,
            cy: y + Math.sin(i * 45 * Math.PI / 180) * 80,
            opacity: 0,
            r: 0,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}

      {/* 중심 링 효과 */}
      <motion.circle
        cx={x}
        cy={y}
        fill="none"
        stroke={color}
        strokeWidth={3}
        initial={{ r: 5, opacity: 1 }}
        animate={{ r: 60, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* 성공 체크마크 */}
      <motion.path
        d={`M ${x-10} ${y} L ${x-3} ${y+8} L ${x+12} ${y-10}`}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.g>
  )
}

// 치수선 컴포넌트 (Phase 5)
const DimensionLines = ({ visible }: { visible: boolean }) => {
  if (!visible) return null

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* 가로 치수선 */}
      <motion.line
        x1="150" y1="340" x2="350" y2="340"
        stroke="#C5A059"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6 }}
      />
      <line x1="150" y1="335" x2="150" y2="345" stroke="#C5A059" strokeWidth="1.5" />
      <line x1="350" y1="335" x2="350" y2="345" stroke="#C5A059" strokeWidth="1.5" />
      <motion.text
        x="250" y="358"
        textAnchor="middle"
        fill="#C5A059"
        fontSize="11"
        fontWeight="bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        12.5m
      </motion.text>

      {/* 세로 치수선 */}
      <motion.line
        x1="400" y1="280" x2="400" y2="180"
        stroke="#C5A059"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      <line x1="395" y1="280" x2="405" y2="280" stroke="#C5A059" strokeWidth="1.5" />
      <line x1="395" y1="180" x2="405" y2="180" stroke="#C5A059" strokeWidth="1.5" />
      <motion.text
        x="420" y="235"
        textAnchor="middle"
        fill="#C5A059"
        fontSize="11"
        fontWeight="bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        8.0m
      </motion.text>

      {/* 스케일 바 */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <rect x="80" y="350" width="50" height="4" fill="#C5A059" />
        <text x="105" y="368" textAnchor="middle" fill="#C5A059" fontSize="9">5m</text>
      </motion.g>
    </motion.g>
  )
}

// 그리드 오버레이 컴포넌트
const GridOverlay = ({ visible, phase }: { visible: boolean; phase: number }) => {
  if (!visible) return null

  const opacity = phase === 1 ? 0.3 : 0.15

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 0.5 }}
    >
      {/* 수직 그리드 */}
      {[100, 150, 200, 250, 300, 350, 400].map((x) => (
        <line
          key={`v-${x}`}
          x1={x} y1="100" x2={x} y2="350"
          stroke="#C5A059"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      ))}
      {/* 수평 그리드 */}
      {[150, 200, 250, 300, 350].map((y) => (
        <line
          key={`h-${y}`}
          x1="100" y1={y} x2="400" y2={y}
          stroke="#C5A059"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      ))}
    </motion.g>
  )
}

export default function AlgorithmicArtCanvas({
  currentPhase,
  totalPhases,
  isRunning,
  confidenceScores = {}
}: AlgorithmicArtCanvasProps) {
  const [particles, setParticles] = useState<PhaseParticle[]>([])
  const [perspective, setPerspective] = useState(0)
  const [celebratingPhase, setCelebratingPhase] = useState<number | null>(null)
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set())
  const prevPhaseRef = useRef(currentPhase)

  // 현재 Phase 스타일
  const currentStyle = PHASE_STYLES[currentPhase] || PHASE_STYLES[1]

  // 건물 파트 생성 (2D 도면 → 3D 건물)
  const buildingParts = useMemo<BuildingPart[]>(() => [
    // Phase 1: 기본 좌표계 - 바닥면
    { id: 'floor1', points: [{x: 150, y: 280}, {x: 350, y: 280}, {x: 380, y: 320}, {x: 120, y: 320}], phase: 1, type: 'floor', delay: 0 },

    // Phase 2: 구조 분석 - 벽체
    { id: 'wall1', points: [{x: 150, y: 280}, {x: 150, y: 180}], phase: 2, type: 'wall', delay: 0.1 },
    { id: 'wall2', points: [{x: 350, y: 280}, {x: 350, y: 180}], phase: 2, type: 'wall', delay: 0.2 },
    { id: 'wall3', points: [{x: 150, y: 180}, {x: 350, y: 180}], phase: 2, type: 'wall', delay: 0.3 },
    { id: 'wall4', points: [{x: 120, y: 320}, {x: 120, y: 220}], phase: 2, type: 'wall', delay: 0.4 },
    { id: 'wall5', points: [{x: 380, y: 320}, {x: 380, y: 220}], phase: 2, type: 'wall', delay: 0.5 },

    // Phase 3: 개구부 - 문과 창문
    { id: 'door1', points: [{x: 200, y: 280}, {x: 200, y: 230}, {x: 240, y: 230}, {x: 240, y: 280}], phase: 3, type: 'door', delay: 0 },
    { id: 'window1', points: [{x: 280, y: 240}, {x: 280, y: 210}, {x: 320, y: 210}, {x: 320, y: 240}], phase: 3, type: 'window', delay: 0.2 },
    { id: 'window2', points: [{x: 160, y: 240}, {x: 160, y: 210}, {x: 190, y: 210}, {x: 190, y: 240}], phase: 3, type: 'window', delay: 0.3 },

    // Phase 4: 공간 분석 - 내부 파티션
    { id: 'partition1', points: [{x: 250, y: 280}, {x: 250, y: 200}], phase: 4, type: 'wall', delay: 0.1 },
    { id: 'floor2', points: [{x: 150, y: 180}, {x: 250, y: 180}, {x: 250, y: 200}, {x: 150, y: 200}], phase: 4, type: 'floor', delay: 0.2 },

    // Phase 5: 치수 정보 - 지붕 구조
    { id: 'roof1', points: [{x: 140, y: 180}, {x: 250, y: 120}, {x: 360, y: 180}], phase: 5, type: 'roof', delay: 0 },
    { id: 'roof2', points: [{x: 110, y: 220}, {x: 250, y: 160}, {x: 390, y: 220}], phase: 5, type: 'roof', delay: 0.2 },

    // Phase 6: 최종 통합 - 장식 요소
    { id: 'chimney', points: [{x: 300, y: 120}, {x: 300, y: 90}, {x: 320, y: 90}, {x: 320, y: 120}], phase: 6, type: 'wall', delay: 0 },
  ], [])

  // Phase 완료 감지 및 축하 효과
  useEffect(() => {
    if (currentPhase > prevPhaseRef.current && currentPhase > 1) {
      const completedPhaseNum = currentPhase - 1
      if (!completedPhases.has(completedPhaseNum)) {
        const newCompleted = new Set(completedPhases)
        newCompleted.add(completedPhaseNum)
        setCompletedPhases(newCompleted)

        // 축하 효과 트리거
        setCelebratingPhase(completedPhaseNum)
        setTimeout(() => setCelebratingPhase(null), 1500)
      }
    }
    prevPhaseRef.current = currentPhase
  }, [currentPhase, completedPhases])

  // Phase별 파티클 위치 생성
  const generateParticlePosition = (phase: number): { x: number; y: number; targetX: number; targetY: number; angle: number } => {
    switch (phase) {
      case 1: // 그리드 패턴으로 천천히 상승
        return {
          x: 100 + Math.floor(Math.random() * 6) * 50,
          y: 350,
          targetX: 100 + Math.floor(Math.random() * 6) * 50,
          targetY: 100,
          angle: 0
        }
      case 2: // 벽체를 따라 수직 상승
        const wallX = [150, 350, 120, 380][Math.floor(Math.random() * 4)]
        return {
          x: wallX,
          y: 320,
          targetX: wallX,
          targetY: 150,
          angle: 0
        }
      case 3: // 개구부 주변에 집중
        const openingCenters = [{ x: 220, y: 255 }, { x: 300, y: 225 }, { x: 175, y: 225 }]
        const center = openingCenters[Math.floor(Math.random() * 3)]
        return {
          x: center.x + (Math.random() - 0.5) * 150,
          y: center.y + (Math.random() - 0.5) * 150,
          targetX: center.x,
          targetY: center.y,
          angle: 0
        }
      case 4: // 건물 내부에서 소용돌이
        const angle = Math.random() * Math.PI * 2
        const radius = 30 + Math.random() * 50
        return {
          x: 250 + Math.cos(angle) * radius,
          y: 230 + Math.sin(angle) * radius,
          targetX: 250 + Math.cos(angle + 1) * radius * 0.8,
          targetY: 230 + Math.sin(angle + 1) * radius * 0.8,
          angle
        }
      case 5: // 치수선을 따라 이동
        const isHorizontal = Math.random() > 0.5
        return {
          x: isHorizontal ? 120 : 400,
          y: isHorizontal ? 340 : 280,
          targetX: isHorizontal ? 380 : 400,
          targetY: isHorizontal ? 340 : 150,
          angle: 0
        }
      case 6: // 방사형 폭발 패턴
        const burstAngle = Math.random() * Math.PI * 2
        return {
          x: 250,
          y: 220,
          targetX: 250 + Math.cos(burstAngle) * 150,
          targetY: 220 + Math.sin(burstAngle) * 150,
          angle: burstAngle
        }
      default:
        return { x: 250, y: 350, targetX: 250, targetY: 200, angle: 0 }
    }
  }

  // 파티클 생성 (Phase 인식)
  useEffect(() => {
    if (!isRunning) return

    const style = PHASE_STYLES[currentPhase] || PHASE_STYLES[1]

    const interval = setInterval(() => {
      const newParticles: PhaseParticle[] = Array.from({ length: style.particleCount }, (_, i) => {
        const pos = generateParticlePosition(currentPhase)
        return {
          id: Date.now() + i,
          ...pos,
          color: style.particleColor,
          size: 2 + Math.random() * 3,
          life: 1,
          pattern: currentPhase.toString(),
        }
      })

      setParticles(prev => [...prev.slice(-50), ...newParticles])
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, currentPhase])

  // 파티클 애니메이션
  useEffect(() => {
    const style = PHASE_STYLES[currentPhase] || PHASE_STYLES[1]

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + (p.targetX - p.x) * style.particleSpeed,
            y: p.y + (p.targetY - p.y) * style.particleSpeed,
            life: p.life - 0.015,
          }))
          .filter(p => p.life > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [currentPhase])

  // 3D 회전 효과 (Phase 4+)
  useEffect(() => {
    if (currentPhase >= 4 && currentStyle.enable3DRotation) {
      const interval = setInterval(() => {
        setPerspective(prev => (prev + 0.5) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [currentPhase, currentStyle.enable3DRotation])

  // 신뢰도 기반 시각 효과
  const getConfidenceMultiplier = (phase: number): number => {
    const confidence = confidenceScores[phase] || 0.7
    return 0.5 + confidence * 0.5
  }

  // 색상 선택 (완료/활성/미완료 상태별)
  const getColor = (type: BuildingPart['type'], partPhase: number) => {
    const confidence = getConfidenceMultiplier(partPhase)

    // 미완료 phase: 거의 안 보임
    if (partPhase > currentPhase) {
      const dimAlpha = 0.08
      switch (type) {
        case 'wall': return `rgba(26, 43, 80, ${dimAlpha})`
        case 'floor': return `rgba(197, 160, 89, ${dimAlpha})`
        case 'window': return `rgba(0, 102, 204, ${dimAlpha})`
        case 'door': return `rgba(154, 33, 45, ${dimAlpha})`
        case 'roof': return `rgba(197, 160, 89, ${dimAlpha})`
        default: return `rgba(139, 134, 128, ${dimAlpha})`
      }
    }

    // 현재 phase: 활성 상태
    if (partPhase === currentPhase) {
      switch (type) {
        case 'wall': return `rgba(26, 43, 80, ${confidence})`
        case 'floor': return `rgba(197, 160, 89, ${confidence * 0.4})`
        case 'window': return `rgba(0, 102, 204, ${confidence})`
        case 'door': return `rgba(154, 33, 45, ${confidence})`
        case 'roof': return `rgba(197, 160, 89, ${confidence})`
        default: return `rgba(139, 134, 128, ${confidence})`
      }
    }

    // 완료된 phase: 신뢰도에 따른 강도
    const completedAlpha = confidence * 0.85
    switch (type) {
      case 'wall': return `rgba(26, 43, 80, ${completedAlpha})`
      case 'floor': return `rgba(197, 160, 89, ${completedAlpha * 0.35})`
      case 'window': return `rgba(0, 102, 204, ${completedAlpha})`
      case 'door': return `rgba(154, 33, 45, ${completedAlpha})`
      case 'roof': return `rgba(197, 160, 89, ${completedAlpha})`
      default: return `rgba(139, 134, 128, ${completedAlpha})`
    }
  }

  // 선 굵기 계산
  const getStrokeWidth = (partPhase: number, isCurrentPhase: boolean): number => {
    if (partPhase > currentPhase) return 1
    const style = PHASE_STYLES[partPhase] || PHASE_STYLES[1]
    const confidence = getConfidenceMultiplier(partPhase)
    const baseWidth = style.strokeWidth
    return isCurrentPhase ? baseWidth + confidence : baseWidth * confidence
  }

  // 글로우 필터 선택
  const getGlowFilter = (partPhase: number, type: BuildingPart['type']): string | undefined => {
    if (partPhase !== currentPhase) return undefined
    if (currentPhase === 3 && (type === 'door' || type === 'window')) {
      return 'url(#glow-opening)'
    }
    if (currentPhase >= 4) {
      return 'url(#glow-gold)'
    }
    return undefined
  }

  const progress = currentPhase / totalPhases

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-primary-navy/5 to-primary-navy/20">
      {/* Grid Background */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />

      {/* SVG Building Animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 400"
        style={{
          transform: currentPhase >= 4 && currentStyle.enable3DRotation
            ? `perspective(1000px) rotateY(${Math.sin(perspective * Math.PI / 180) * 5}deg)`
            : 'none',
          transition: 'transform 0.5s ease'
        }}
      >
        <defs>
          {/* Glow Filters */}
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-crimson" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-opening" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Gradient Fills */}
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A2B50" />
            <stop offset="100%" stopColor="#0F1A30" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#9A7B3A" />
          </linearGradient>
        </defs>

        {/* Grid Overlay */}
        <GridOverlay visible={currentStyle.showGrid || false} phase={currentPhase} />

        {/* Building Parts */}
        {buildingParts.map((part) => {
          const isActive = part.phase <= currentPhase
          const isCurrentPhase = part.phase === currentPhase
          const strokeWidth = getStrokeWidth(part.phase, isCurrentPhase)
          const filter = getGlowFilter(part.phase, part.type)
          const strokeDasharray = part.phase === 1 && currentPhase === 1 ? '8 4' : undefined

          if (part.points.length === 2) {
            // Line (wall)
            return (
              <motion.line
                key={part.id}
                x1={part.points[0].x}
                y1={part.points[0].y}
                x2={part.points[1].x}
                y2={part.points[1].y}
                stroke={getColor(part.type, part.phase)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                filter={filter}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? {
                  pathLength: 1,
                  opacity: 1,
                  strokeWidth: isCurrentPhase ? [strokeWidth, strokeWidth + 1, strokeWidth] : strokeWidth
                } : { pathLength: 0, opacity: 0.1 }}
                transition={{
                  duration: 0.8,
                  delay: part.delay,
                  ease: "easeOut",
                  strokeWidth: { duration: 1.5, repeat: Infinity }
                }}
              />
            )
          } else {
            // Polygon (floor, window, door, roof)
            const d = `M ${part.points.map(p => `${p.x},${p.y}`).join(' L ')} Z`
            return (
              <motion.path
                key={part.id}
                d={d}
                fill={part.type === 'floor' ? getColor(part.type, part.phase) : 'none'}
                stroke={getColor(part.type, part.phase)}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeDasharray={strokeDasharray}
                filter={filter}
                initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
                animate={isActive ? {
                  pathLength: 1,
                  opacity: 1,
                  fillOpacity: part.type === 'floor' ? currentStyle.fillOpacity : 0,
                  scale: isCurrentPhase ? [1, 1.01, 1] : 1
                } : { pathLength: 0, opacity: 0.1, fillOpacity: 0 }}
                transition={{
                  duration: 1,
                  delay: part.delay,
                  ease: "easeOut",
                  scale: { duration: 2, repeat: Infinity }
                }}
              />
            )
          }
        })}

        {/* Dimension Lines (Phase 5) */}
        <DimensionLines visible={currentPhase >= 5 && currentStyle.showDimensions === true} />

        {/* Data Particles */}
        {particles.map(particle => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={particle.life}
            filter="url(#glow-gold)"
          />
        ))}

        {/* Phase Completion Celebration */}
        <AnimatePresence>
          {celebratingPhase !== null && (
            <PhaseCompletionBurst
              phase={celebratingPhase}
              x={250}
              y={220}
            />
          )}
        </AnimatePresence>

        {/* Center Point - AI Focus */}
        {isRunning && (
          <motion.circle
            cx="250"
            cy="220"
            r="5"
            fill={PHASE_COLORS[currentPhase] || '#C5A059'}
            filter="url(#glow-gold)"
            animate={{
              r: [5, 8, 5],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </svg>

      {/* Phase Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: PHASE_COLORS[currentPhase] || '#00A86B' }}
          animate={isRunning ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-sm font-medium text-primary-navy">
          {isRunning ? `Phase ${currentPhase}: ${currentStyle.name}` : '분석 대기'}
        </span>
      </div>

      {/* Phase Progress Pills */}
      <div className="absolute top-4 right-4 flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((phase) => (
          <motion.div
            key={phase}
            className="w-2 h-6 rounded-full"
            style={{
              backgroundColor: phase <= currentPhase
                ? PHASE_COLORS[phase]
                : 'rgba(197, 160, 89, 0.2)'
            }}
            initial={{ scaleY: 0.3 }}
            animate={{
              scaleY: phase <= currentPhase ? 1 : 0.3,
              opacity: phase === currentPhase ? [0.7, 1, 0.7] : 1
            }}
            transition={{
              duration: 0.3,
              opacity: phase === currentPhase ? { duration: 1, repeat: Infinity } : {}
            }}
          />
        ))}
      </div>

      {/* Progress Arc */}
      <svg className="absolute bottom-4 right-4 w-16 h-16" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(197, 160, 89, 0.2)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={PHASE_COLORS[currentPhase] || '#C5A059'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress * 251.2} 251.2`}
          transform="rotate(-90 50 50)"
          filter="url(#glow-gold)"
          initial={{ strokeDasharray: "0 251.2" }}
          animate={{ strokeDasharray: `${progress * 251.2} 251.2` }}
          transition={{ duration: 0.5 }}
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          className="text-lg font-bold fill-primary-navy"
        >
          {Math.round(progress * 100)}%
        </text>
      </svg>

      {/* Confidence Score Display */}
      {currentPhase > 0 && confidenceScores[currentPhase] && (
        <motion.div
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentPhase}
        >
          <div className="text-xs text-neutral-warmGray">신뢰도</div>
          <div className="flex items-center gap-2">
            <div
              className="text-lg font-bold"
              style={{ color: PHASE_COLORS[currentPhase] }}
            >
              {(confidenceScores[currentPhase] * 100).toFixed(1)}%
            </div>
            {/* Mini confidence bar */}
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: PHASE_COLORS[currentPhase] }}
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScores[currentPhase] * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Final Completion Effect */}
      <AnimatePresence>
        {currentPhase === totalPhases && !isRunning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Golden Ring */}
            <motion.div
              className="absolute w-32 h-32 rounded-full border-4 border-primary-gold"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0.5] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Center Icon */}
            <motion.div
              className="text-5xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            >
              <span className="filter drop-shadow-lg">🏛️</span>
            </motion.div>

            {/* Success Particles */}
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: PHASE_COLORS[(i % 6) + 1]
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(i * 22.5 * Math.PI / 180) * 120,
                  y: Math.sin(i * 22.5 * Math.PI / 180) * 120,
                  opacity: 0,
                  scale: 0
                }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
