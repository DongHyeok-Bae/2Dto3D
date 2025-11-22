# components/admin - 관리자 컴포넌트

**생성일**: 2024-11-22
**Phase**: 2 - 관리자 대시보드

## 📌 목적
관리자 대시보드 전용 UI 컴포넌트

## 📁 컴포넌트 목록

### `PromptEditor.tsx`
Monaco Editor 기반 프롬프트 편집기

#### Props:
- `initialValue`: 초기 프롬프트 내용
- `onChange`: 내용 변경 콜백
- `readonly`: 읽기 전용 모드

#### 특징:
- VS Code 스타일 에디터
- Markdown 문법 하이라이팅
- 다크 테마
- 자동 줄바꿈
- 미니맵 비활성화

## 🚀 다음 작업
- ResultViewer: 실행 결과 뷰어
- ComparisonView: 프롬프트 비교
- PhaseFlow: Phase 의존성 시각화
