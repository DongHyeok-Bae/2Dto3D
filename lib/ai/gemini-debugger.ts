/**
 * Gemini API 전용 디버거 (v3 - Phase 결과 동적 감지)
 * - SYSTEM과 USER 메시지를 명확히 구분하여 출력
 * - 실제 JSON 파싱으로 포함된 Phase 결과를 동적으로 감지
 */

export class GeminiDebugger {
  private phaseNumber: number

  constructor(phaseNumber: number) {
    this.phaseNumber = phaseNumber
  }

  /**
   * 텍스트에서 JSON 객체를 추출하고 Phase 결과 여부를 동적으로 감지
   * - 하드코딩된 헤더 패턴 대신 실제 JSON 파싱으로 감지
   * @returns { isPhaseResult: boolean, includedPhases: number[], summary: string }
   */
  private detectPhaseResults(text: string): {
    isPhaseResult: boolean
    includedPhases: number[]
    summary: string
  } {
    // Step 1: 텍스트에서 JSON 객체 추출 시도
    // 패턴: { ... } 형태의 JSON 블록 찾기
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { isPhaseResult: false, includedPhases: [], summary: '' }
    }

    // Step 2: JSON 파싱 시도
    let parsedJson: any
    try {
      parsedJson = JSON.parse(jsonMatch[0])
    } catch {
      // JSON 파싱 실패 시 일반 텍스트로 처리
      return { isPhaseResult: false, includedPhases: [], summary: '' }
    }

    // Step 3: 최상위 키에서 Phase 번호 동적 추출
    // 키 패턴: "phase1", "phase2", ... "phase7"
    const includedPhases: number[] = []
    const keys = Object.keys(parsedJson)

    for (const key of keys) {
      const phaseMatch = key.match(/^phase(\d+)$/)
      if (phaseMatch) {
        includedPhases.push(parseInt(phaseMatch[1], 10))
      }
    }

    // Phase 키가 없으면 일반 JSON으로 처리
    if (includedPhases.length === 0) {
      return { isPhaseResult: false, includedPhases: [], summary: '' }
    }

    // Step 4: 정렬 및 요약 문자열 생성
    includedPhases.sort((a, b) => a - b)
    const summary = `[✓ Phase ${includedPhases.join(', ')} 결과 포함]`

    return { isPhaseResult: true, includedPhases, summary }
  }

  /**
   * API 요청 데이터 출력 (v3)
   * - SYSTEM: 요약만 표시 (앞 5줄 + 길이 정보)
   * - USER: Phase 데이터는 요약, 일반 텍스트는 전체 표시
   */
  logRequest(config: any, contents: any[]): void {
    console.log('\n' + '='.repeat(80))
    console.log(`[Phase ${this.phaseNumber}] GEMINI API REQUEST`)
    console.log('='.repeat(80))

    // 1. CONFIG
    console.log('\n[CONFIG]')
    console.log(JSON.stringify({
      temperature: config.temperature,
      thinkingConfig: config.thinkingConfig,
      mediaResolution: config.mediaResolution,
    }, null, 2))

    // 2. SYSTEM INSTRUCTION (요약만 표시)
    console.log('\n' + '-'.repeat(80))
    console.log('[SYSTEM INSTRUCTION] (요약)')
    console.log('-'.repeat(80))
    if (config.systemInstruction && config.systemInstruction[0]?.text) {
      const text = config.systemInstruction[0].text
      const lines = text.split('\n')
      const preview = lines.slice(0, 5).join('\n')
      console.log(preview)
      console.log(`... (총 ${lines.length}줄, ${text.length}자)`)
    } else {
      console.log('(없음)')
    }

    // 3. USER MESSAGE - 큰 배너로 구분
    console.log('\n')
    console.log('################################################################################')
    console.log('##                                                                            ##')
    console.log('##                         [USER MESSAGE - 유저 메시지]                        ##')
    console.log('##                                                                            ##')
    console.log('################################################################################')

    contents.forEach((message, msgIndex) => {
      console.log(`\nMessage ${msgIndex + 1} (role: ${message.role})`)
      console.log('-'.repeat(40))

      message.parts?.forEach((part: any, partIndex: number) => {
        if (part.inlineData) {
          console.log(`[Part ${partIndex + 1}] IMAGE: ${part.inlineData.mimeType}, length: ${part.inlineData.data?.length || 0}`)
        } else if (part.text) {
          // Phase 결과 동적 감지
          const detection = this.detectPhaseResults(part.text)

          if (detection.isPhaseResult) {
            // Phase 결과인 경우: 요약만 표시
            console.log(`[Part ${partIndex + 1}] PHASE DATA:`)
            console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
            console.log(`║  ${detection.summary.padEnd(74)}║`)
            console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
            console.log(`    (JSON 데이터 ${part.text.length}자 - 요약 생략)`)
          } else {
            // 일반 텍스트: 전체 표시
            console.log(`[Part ${partIndex + 1}] TEXT:`)
            console.log('>>>>')
            console.log(part.text)
            console.log('<<<<')
          }
        }
      })
    })

    console.log('\n################################################################################')
    console.log('='.repeat(80))
  }

  /**
   * API 응답 결과 출력
   */
  logResponse(result: any, durationMs: number): void {
    console.log('\n' + '='.repeat(80))
    console.log(`[Phase ${this.phaseNumber}] GEMINI API RESPONSE (${durationMs}ms)`)
    console.log('='.repeat(80))
    console.log(JSON.stringify(result, null, 2))
    console.log('='.repeat(80))
  }
}
