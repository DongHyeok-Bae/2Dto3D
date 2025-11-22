# 2Dto3D - AI 기반 건축 도면 3D BIM 변환 서비스

<div align="center">
  <img src="/public/logo-crossover.png" alt="2Dto3D × 경희대학교" width="400">

  **BIM-AutoConverter v3.0**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-0.160-green)](https://threejs.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
</div>

## 📌 소개

2Dto3D는 Google Gemini AI를 활용하여 2D 건축 도면을 실시간으로 3D BIM 모델로 변환하는 혁신적인 웹 서비스입니다. 경희대학교 건축공학과와 함께 개발된 이 도구는 건축 설계 프로세스를 획기적으로 개선합니다.

### ✨ 주요 기능

- 🎯 **AI 기반 도면 분석**: Google Gemini 3 Pro를 활용한 정확한 도면 인식
- 🏗️ **7단계 변환 파이프라인**: 체계적인 단계별 BIM 데이터 생성
- 🎨 **실시간 3D 시각화**: Three.js 기반 인터랙티브 3D 뷰어
- 💾 **다양한 내보내기**: glTF, OBJ, STL, IFC-like, CSV 등 지원
- 📁 **프로젝트 관리**: 저장/불러오기 기능
- 🎛️ **관리자 대시보드**: 프롬프트 실시간 편집 및 버전 관리

## 🚀 시작하기

### 필요 사항

- Node.js 18.17 이상
- npm 또는 yarn
- Google AI API 키 ([발급하기](https://makersuite.google.com/app/apikey))
- Vercel 계정 (선택사항)

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/2dto3d.git
cd 2dto3d/2dto3d_ver0
```

2. **의존성 설치**
```bash
npm install
# 또는
yarn install
```

3. **환경 변수 설정**
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 다음 값들을 설정:
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **개발 서버 실행**
```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📖 사용 방법

### 1️⃣ 이미지 업로드
- 2D 건축 도면 이미지를 드래그 앤 드롭 또는 파일 선택
- 지원 형식: PNG, JPEG, WebP (최대 10MB)

### 2️⃣ AI 분석 실행
- 7단계 파이프라인 자동 실행
  - Phase 1: 좌표계 정규화
  - Phase 2: 구조 요소 추출
  - Phase 3: 개구부 인식
  - Phase 4: 공간 분석
  - Phase 5: 치수 계산
  - Phase 6: 신뢰도 검증
  - Phase 7: Master JSON 생성

### 3️⃣ 결과 확인
- Phase별 상세 결과 조회
- JSON 형식 데이터 확인

### 4️⃣ 3D 모델 시각화
- 인터랙티브 3D 뷰어
- 요소 클릭으로 정보 확인
- 카메라 컨트롤 (회전, 이동, 줌)

### 5️⃣ 데이터 내보내기
- **3D 형식**: glTF, GLB, OBJ, STL
- **데이터 형식**: JSON, CSV, IFC-like
- **프로젝트**: .2d3d 파일로 저장/불러오기

## 🏗️ 프로젝트 구조

```
2dto3d_ver0/
├── app/                    # Next.js App Router
│   ├── (main)/            # 메인 서비스
│   ├── admin/             # 관리자 대시보드
│   └── api/               # API 엔드포인트
├── components/            # React 컴포넌트
│   ├── upload/           # 이미지 업로드
│   ├── pipeline/         # 파이프라인 실행
│   ├── results/          # 결과 뷰어
│   ├── viewer/           # 3D 뷰어
│   └── export/           # 내보내기
├── lib/                   # 유틸리티
│   ├── ai/               # Gemini API
│   ├── three/            # 3D 씬 빌더
│   ├── export/           # 내보내기 유틸
│   └── project/          # 프로젝트 관리
├── store/                 # Zustand 상태 관리
├── types/                 # TypeScript 타입
└── public/               # 정적 파일
```

## 🎨 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **AI**: Google Gemini 1.5 Pro
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel

## 📚 스크립트 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 검사
npm run type-check   # TypeScript 타입 체크
npm run format       # Prettier 포맷팅
```

## 🚀 배포

### Vercel로 배포

1. [Vercel](https://vercel.com)에 로그인
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포 클릭

### 환경 변수 (Production)

Vercel 대시보드에서 설정:
- `GOOGLE_AI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_APP_URL` (배포된 URL로 설정)

## 🎯 개발 로드맵

- [x] Phase 0: 프로젝트 초기 설정
- [x] Phase 1: 프롬프트 관리 인프라
- [x] Phase 2: 관리자 대시보드
- [x] Phase 3: AI 파이프라인 구현
- [x] Phase 4: 사용자 인터페이스
- [x] Phase 5: 3D 뷰어 구현
- [x] Phase 6: 편집 및 내보내기
- [x] Phase 7: 최적화 및 배포
- [ ] Phase 8: 테스트 및 문서화
- [ ] Phase 9: 사용자 피드백 및 개선

## 📝 라이선스

MIT License

## 👥 팀

- **경희대학교 건축공학과**
- **2Dto3D 건축시스템설계 Team**

## 📞 문의

- kkt: dhbae07
- Email: dhbae07@naver.com

## 🙏 감사의 말

- thank yaaa, Claude code!!!!
- and also thank you, Ph.D JangWoon-Baek 
- Google Gemini AI
- KungHee.U, ArchitectureEngineering

---

<div align="center">
  Made with ❤️ by Kyung Hee University × 2Dto3D Team
</div>