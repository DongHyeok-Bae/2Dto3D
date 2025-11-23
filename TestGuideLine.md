# 🧪 2Dto3D 로컬 테스트 가이드

## 📋 목차
1. [사전 준비 작업](#1-사전-준비-작업)
2. [개발 서버 시작](#2-개발-서버-시작)
3. [테스트해야 할 기능](#3-테스트해야-할-기능)
4. [단계별 테스트 시나리오](#4-단계별-테스트-시나리오)
5. [문제 해결 가이드](#5-문제-해결-가이드)
6. [성능 체크리스트](#6-성능-체크리스트)

---

## 1. 사전 준비 작업

### 1.1 환경 변수 설정 (필수)

```bash
# .env.example을 복사하여 .env.local 생성
copy .env.example .env.local
```

`.env.local` 파일을 열고 다음 값들을 **실제 값으로 변경**:

```env
# ⚠️ 필수: Google AI API 키 발급 및 설정
GOOGLE_AI_API_KEY=여기에_실제_구글_AI_API_키_입력

# ⚠️ 선택: Vercel Blob Storage (프로젝트 클라우드 저장용)
# 로컬 테스트만 할 경우 생략 가능 (로컬 파일 저장만 동작)
BLOB_READ_WRITE_TOKEN=여기에_실제_Vercel_Blob_토큰_입력

# 로컬 개발 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**API 키 발급 방법:**
- **Google AI API**: https://makersuite.google.com/app/apikey
  1. Google 계정으로 로그인
  2. "Create API Key" 클릭
  3. 생성된 키를 복사하여 `.env.local`에 붙여넣기

- **Vercel Blob Storage** (선택사항): https://vercel.com/dashboard/stores
  1. Vercel 계정 생성/로그인
  2. "Storage" → "Create Database" → "Blob" 선택
  3. 생성된 토큰 복사

### 1.2 의존성 설치

```bash
# Node.js 18.17 이상 확인
node --version

# npm 버전 확인
npm --version

# 의존성 설치
npm install
```

### 1.3 TypeScript 타입 체크 (선택사항)

```bash
npm run type-check
```

---

## 2. 개발 서버 시작

### 2.1 기본 실행

```bash
npm run dev
```

**실행 결과:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 2.2 브라우저 접속

브라우저에서 다음 URL을 엽니다:
- 메인 페이지: http://localhost:3000
- 서비스 페이지: http://localhost:3000/service
- 관리자 페이지: http://localhost:3000/admin

---

## 3. 테스트해야 할 기능

### ✅ 핵심 기능 체크리스트

#### Phase 0-1: 프롬프트 관리 시스템
- [x] 관리자 페이지 접근
- [ ] 프롬프트 목록 로드
- [ ] 프롬프트 편집 및 저장
- [ ] 버전 비교 기능
- [ ] 실시간 프리뷰

#### Phase 2-4: AI 파이프라인
- [x] 이미지 업로드 (드래그 앤 드롭)
- [ ] 파일 크기 제한 확인 (10MB)
- [ ] 지원 포맷 확인 (PNG, JPEG, WebP)
- [ ] 7단계 파이프라인 실행
- [ ] Phase별 진행 상태 표시
- [ ] Phase별 결과 JSON 확인
- [ ] 에러 핸들링 (API 키 오류, 네트워크 오류 등)

#### Phase 5: 3D 뷰어
- [ ] 3D 모델 렌더링
- [ ] 카메라 컨트롤 (회전, 줌, 팬)
- [ ] 벽, 바닥, 개구부 표시
- [ ] 공간 영역 표시
- [ ] 요소 클릭 시 정보 표시
- [ ] 뷰 리셋 기능
- [ ] 스크린샷 캡처

#### Phase 6: 내보내기 및 프로젝트 관리
- [ ] JSON 내보내기
- [ ] CSV 내보내기 (Walls, Spaces, Doors, Windows)
- [ ] IFC-like 내보내기
- [ ] 3D 모델 내보내기 (glTF, GLB, OBJ, STL)
- [ ] 스크린샷 내보내기
- [ ] 프로젝트 저장 (.2d3d)
- [ ] 프로젝트 불러오기
- [ ] 클라우드 저장 (Vercel Blob - 토큰 설정 시)

#### Phase 7: SEO 및 최적화
- [ ] 페이지 메타데이터 확인
- [ ] 파비콘 표시 확인
- [ ] PWA 매니페스트
- [ ] 반응형 디자인 (모바일, 태블릿, 데스크톱)

---

## 4. 단계별 테스트 시나리오

### 🎯 시나리오 1: 첫 사용자 플로우

**목표**: 이미지 업로드부터 3D 모델 내보내기까지 전체 워크플로우 테스트

1. **서비스 페이지 접속**
   ```
   http://localhost:3000/service
   ```

2. **이미지 업로드**
   - 테스트 이미지 준비 (건축 도면 PNG/JPEG)
   - 드래그 앤 드롭 또는 파일 선택
   - 이미지 프리뷰 확인

3. **AI 분석 실행**
   - "BIM 변환 시작" 버튼 클릭
   - 각 Phase 진행 상황 모니터링:
     ```
     Phase 1: 좌표계 정규화 (5-10초)
     Phase 2: 구조 요소 추출 (10-15초)
     Phase 3: 개구부 인식 (10-15초)
     Phase 4: 공간 분석 (10-15초)
     Phase 5: 치수 계산 (5-10초)
     Phase 6: 신뢰도 검증 (5-10초)
     Phase 7: Master JSON 생성 (10-15초)
     ```
   - 총 소요 시간: **약 1-2분**

4. **결과 확인**
   - "Results" 탭 클릭
   - Phase별 JSON 데이터 확인
   - 각 Phase의 confidence_score 확인

5. **3D 뷰어 확인**
   - "3D Viewer" 탭 클릭
   - 3D 모델 로딩 확인
   - 마우스로 회전/줌 테스트
   - 벽, 바닥, 문, 창문 클릭하여 정보 확인

6. **내보내기 테스트**
   - "Export" 탭 클릭
   - JSON 다운로드 → 파일 열어서 확인
   - glTF 다운로드 → 3D 뷰어(예: https://gltf-viewer.donmccurdy.com)에서 확인
   - 스크린샷 다운로드

7. **프로젝트 저장**
   - 프로젝트 이름 입력 (예: "테스트_프로젝트_1")
   - "Save Project" 클릭
   - `.2d3d` 파일 다운로드 확인

8. **프로젝트 불러오기**
   - 페이지 새로고침
   - "Load Project" 클릭
   - 저장한 `.2d3d` 파일 선택
   - 이전 상태 복원 확인

### 🎯 시나리오 2: 관리자 기능 테스트

1. **관리자 페이지 접속**
   ```
   http://localhost:3000/admin
   ```

2. **프롬프트 관리**
   - 프롬프트 목록 로드 확인 (Phase 1-7)
   - Phase 1 프롬프트 선택
   - Monaco Editor에서 내용 확인

3. **프롬프트 편집**
   - 프롬프트 내용 일부 수정 (예: 주석 추가)
   - "Save Changes" 클릭
   - Vercel Blob에 저장 확인 (토큰 설정 시)
   - 또는 JSON 다운로드

4. **버전 비교**
   - 수정 전/후 Diff 뷰 확인
   - 변경 사항 하이라이트 확인

5. **테스트 실행**
   - "Test Prompt" 버튼 클릭
   - 테스트 이미지로 해당 Phase만 실행
   - 결과 확인

### 🎯 시나리오 3: 에러 핸들링 테스트

1. **API 키 오류**
   - `.env.local`에서 `GOOGLE_AI_API_KEY`를 잘못된 값으로 변경
   - 서버 재시작: `npm run dev`
   - 파이프라인 실행 시 에러 메시지 확인
   - 원래 값으로 복구

2. **파일 크기 제한**
   - 10MB 이상 이미지 업로드 시도
   - 에러 메시지 확인

3. **지원하지 않는 파일 형식**
   - PDF, GIF 등 업로드 시도
   - 파일 형식 에러 확인

4. **네트워크 오류**
   - 개발자 도구 → Network → Offline 설정
   - 파이프라인 실행 시도
   - 네트워크 에러 핸들링 확인

### 🎯 시나리오 4: 성능 테스트

1. **여러 이미지 연속 처리**
   - 3-5개 이미지 순차적으로 업로드 및 처리
   - 메모리 사용량 모니터링 (개발자 도구 → Performance)

2. **3D 렌더링 성능**
   - 복잡한 도면 (많은 벽/문/창문) 테스트
   - FPS 확인 (개발자 도구 → Performance Monitor)
   - 60 FPS 유지 확인

3. **대용량 내보내기**
   - 큰 프로젝트 glTF/OBJ 내보내기
   - 파일 크기 확인
   - 다운로드 시간 측정

---

## 5. 문제 해결 가이드

### ❌ 문제 1: 서버가 시작되지 않음

**증상:**
```
Error: Cannot find module 'next'
```

**해결:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### ❌ 문제 2: API 키 오류

**증상:**
```
Error: Google AI API key not configured
```

**해결:**
1. `.env.local` 파일 확인
2. `GOOGLE_AI_API_KEY` 값이 올바른지 확인
3. API 키에 따옴표가 없는지 확인
4. 서버 재시작

### ❌ 문제 3: Vercel Blob 오류

**증상:**
```
Error: Blob storage token not configured
```

**해결:**
- 로컬 테스트만 할 경우 무시 가능 (로컬 파일 저장 사용)
- 클라우드 저장이 필요한 경우:
  1. `.env.local`에 `BLOB_READ_WRITE_TOKEN` 추가
  2. Vercel에서 토큰 발급

### ❌ 문제 4: 3D 모델이 표시되지 않음

**증상:**
- 3D Viewer 탭이 비어있음

**해결:**
1. 브라우저 콘솔 확인 (F12)
2. WebGL 지원 확인:
   ```javascript
   // 브라우저 콘솔에서 실행
   document.createElement('canvas').getContext('webgl')
   ```
3. 그래픽 카드 드라이버 업데이트
4. 다른 브라우저에서 테스트 (Chrome, Edge 권장)

### ❌ 문제 5: 파이프라인이 중간에 멈춤

**증상:**
- Phase 3에서 진행이 멈춤

**해결:**
1. Google AI API 할당량 확인
2. 네트워크 연결 확인
3. 이미지 품질 확인 (너무 흐리거나 저화질인 경우)
4. 브라우저 콘솔에서 에러 로그 확인

### ❌ 문제 6: TypeScript 타입 오류

**증상:**
```
Type error: Property 'xxx' does not exist
```

**해결:**
```bash
# 타입 정의 재생성
npm run type-check

# tsconfig.json 확인
# strict 모드가 너무 엄격한 경우 일시적으로 완화
```

---

## 6. 성능 체크리스트

### 🚀 최적화 확인 사항

#### 빌드 성능
```bash
# 프로덕션 빌드 테스트
npm run build

# 번들 크기 분석
npm run build:analyze
```

**정상 범위:**
- First Load JS: < 300KB
- Page Load Time: < 2초
- Build Time: < 2분

#### 런타임 성능

**메트릭 목표:**
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **3D Viewer FPS**: > 60 FPS

**측정 방법:**
1. Chrome DevTools → Lighthouse
2. "Generate report" 클릭
3. Performance 점수 확인 (목표: > 90점)

#### 메모리 사용

**확인 방법:**
1. Chrome DevTools → Performance Monitor
2. 파이프라인 실행 중 모니터링
3. 메모리 누수 확인

**정상 범위:**
- Heap Size: < 100MB (유휴 상태)
- Heap Size: < 500MB (파이프라인 실행 중)

---

## 7. 테스트 체크리스트

### 📊 기능별 테스트 완료 체크

#### 이미지 업로드
- [ ] 드래그 앤 드롭 동작
- [ ] 파일 선택 버튼 동작
- [ ] 이미지 프리뷰 표시
- [ ] 파일 크기 제한 (10MB)
- [ ] 지원 포맷 확인 (PNG, JPEG, WebP)
- [ ] 에러 메시지 표시

#### AI 파이프라인
- [ ] Phase 1-7 모두 실행
- [ ] 진행 상황 표시
- [ ] 각 Phase 결과 JSON 생성
- [ ] confidence_score 계산
- [ ] 에러 핸들링

#### 결과 뷰어
- [ ] Phase별 탭 전환
- [ ] JSON 포맷팅 및 하이라이트
- [ ] 복사 기능
- [ ] 확대/축소
- [ ] 검색 기능 (Monaco Editor)

#### 3D 뷰어
- [ ] 3D 모델 렌더링
- [ ] 카메라 회전 (마우스 드래그)
- [ ] 줌 인/아웃 (마우스 휠)
- [ ] 팬 (마우스 우클릭 드래그)
- [ ] 요소 클릭 시 정보 표시
- [ ] 뷰 리셋 버튼
- [ ] 스크린샷 버튼
- [ ] 레이어 토글 (벽, 바닥, 공간)

#### 내보내기
- [ ] JSON 다운로드
- [ ] CSV 다운로드 (4가지 타입)
- [ ] IFC-like 다운로드
- [ ] glTF 다운로드
- [ ] GLB 다운로드
- [ ] OBJ 다운로드
- [ ] STL 다운로드
- [ ] 스크린샷 PNG 다운로드
- [ ] 파일명 자동 생성 (타임스탬프)

#### 프로젝트 관리
- [ ] 프로젝트 저장 (.2d3d)
- [ ] 프로젝트 불러오기
- [ ] 프로젝트 메타데이터 (이름, 설명)
- [ ] 버전 정보
- [ ] 클라우드 저장 (Blob 토큰 설정 시)

#### 관리자 대시보드
- [ ] 프롬프트 목록 로드
- [ ] 프롬프트 선택
- [ ] Monaco Editor 표시
- [ ] 프롬프트 편집
- [ ] 저장 기능
- [ ] 버전 비교 (Diff)
- [ ] 테스트 실행

#### SEO 및 메타데이터
- [ ] 페이지 제목 표시
- [ ] 파비콘 표시
- [ ] Open Graph 메타태그
- [ ] Twitter Card 메타태그
- [ ] 반응형 디자인
- [ ] PWA 매니페스트

---

## 8. 테스트 데이터

### 📁 권장 테스트 이미지

**준비할 건축 도면:**
1. **간단한 도면**: 방 1-2개, 벽 4-6개
2. **중간 복잡도**: 방 3-5개, 문/창문 5-10개
3. **복잡한 도면**: 방 6개 이상, 개구부 15개 이상

**이미지 요구사항:**
- 해상도: 최소 800x600px, 권장 1920x1080px
- 파일 크기: < 10MB
- 형식: PNG (권장), JPEG, WebP
- 품질: 선명하고 읽기 쉬운 도면

---

## 9. 성공 기준

### ✅ 테스트 통과 조건

1. **기능 완전성**: 모든 핵심 기능이 오류 없이 동작
2. **성능**: Lighthouse 점수 > 90점
3. **안정성**: 3회 연속 파이프라인 실행 성공
4. **UX**: 모든 사용자 인터랙션에 즉각 반응
5. **오류 처리**: 모든 예상 오류에 대한 적절한 메시지 표시

---

## 10. 추가 테스트 (선택사항)

### 🔬 고급 테스트

#### 브라우저 호환성
- [ ] Chrome (권장)
- [ ] Edge
- [ ] Firefox
- [ ] Safari

#### 반응형 테스트
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### 접근성
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 호환성
- [ ] 색상 대비 (WCAG AA)

---

## 📞 문제 발생 시

테스트 중 해결되지 않는 문제가 발생하면:
1. 브라우저 콘솔 로그 복사
2. 발생한 단계 및 재현 방법 기록
3. 스크린샷 첨부
4. GitHub Issues에 보고

---

**Happy Testing! 🎉**

> 이 가이드는 2Dto3D v0.1.0 기준으로 작성되었습니다.
> 마지막 업데이트: 2025-11-22
