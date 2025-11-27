# lib/ai - AI 프롬프트 및 처리

**생성일**: 2024-11-22
**Phase**: 1 - 프롬프트 관리 인프라
**최종 수정**: 2024-11-27 (6단계 파이프라인 축소)

## 📌 목적
Google Gemini AI 통합 및 Phase 1-6 프롬프트 관리

## 📁 폴더 구조

```
lib/ai/
├── prompts/              # Phase별 프롬프트 파일
│   ├── phase1.md        # Normalization (좌표계 설정)
│   ├── phase2.md        # Structure (구조 추출)
│   ├── phase3.md        # Openings (개구부 인식)
│   ├── phase4.md        # Spaces (공간 분석)
│   ├── phase5.md        # Dimensions (치수 계산)
│   └── phase6.md        # Master JSON (최종 BIM JSON 생성)
├── gemini-client.ts     # Gemini API 클라이언트
└── prompt-loader.ts     # 프롬프트 로더 (Blob Storage)
```

## 🎯 프롬프트 설계 원칙

### 1. 단계적 분해 (Step-by-Step Decomposition)
- 각 Phase는 독립적인 단일 임무 수행
- 복잡한 문제를 6단계로 분해

### 2. Data-Driven Approach
- AI는 JSON만 생성
- 렌더링은 별도 엔진이 담당

### 3. End-to-End Pipeline
- Phase 1-5에서 이미지 분석
- Phase 6에서 최종 BIM JSON 생성

## 📝 프롬프트 버전 관리

### 저장 위치
- **개발 중**: `/lib/ai/prompts/phase*.md`
- **프로덕션**: Vercel Blob Storage (`prompts/phase*/v*.md`)

### 버전 관리 전략
- Semantic Versioning (v1.0.0)
- 주요 변경: Major 증가
- 기능 추가: Minor 증가
- 버그 수정: Patch 증가

## ✅ 주요 함수

### `gemini-client.ts`
Gemini 1.5 Pro API 클라이언트 구현

#### 주요 함수:
- `analyzeWithGemini(imageBase64, prompt, phaseNumber)`: Phase 1-5 이미지 분석
- `executePhase6(input: Phase6Input)`: Phase 6 Master JSON 생성 (Phase 1-5 결과 종합)
- `checkGeminiStatus()`: API 상태 확인

#### 특징:
- Base64 이미지 처리
- JSON 응답 파싱 (```json ... ``` 형식 지원)
- 에러 핸들링
- Phase별 커스터마이징

## 🚀 다음 작업
- 프롬프트 템플릿 최적화
- 응답 캐싱
- Rate limiting 구현
