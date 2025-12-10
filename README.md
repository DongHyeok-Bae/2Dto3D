# 2Dto3D - AI 기반 건축 도면 3D BIM 변환 서비스

<div align="center">
  <img src="/public/logo-crossover.png" alt="2Dto3D × 경희대학교" width="400">

  ### 2D 건축 도면을 3D BIM 모델로 자동 변환하는 AI 웹 서비스

  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-2dto3d--khu.kr-9A212D?style=for-the-badge)](https://2dto3d-khu.kr/)

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-0.160-black?style=flat-square&logo=three.js)](https://threejs.org/)
  [![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

  <br/>

  **[🌐 서비스 바로가기](https://2dto3d-khu.kr/)** · [📖 사용 가이드](#-사용-방법) · [🛠️ 설치 방법](#-로컬-개발-환경-설정)

</div>

---

## 🎯 서비스 소개

> **2Dto3D**는 Google Gemini AI를 활용하여 2D 건축 도면 이미지를 분석하고, 실시간으로 3D BIM 모델로 변환하는 웹 서비스입니다.

### 이런 분들에게 추천합니다

- 🏗️ 건축 도면을 빠르게 3D로 시각화하고 싶은 **건축가/설계사**
- 📐 BIM 데이터가 필요한 **건설 엔지니어**
- 🎓 건축 설계를 학습하는 **학생**
- 💼 클라이언트에게 3D 모델을 보여주고 싶은 **건축 사무소**

---

## ✨ 주요 기능

<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/artificial-intelligence.png" width="48"/><br/>
      <b>AI 도면 분석</b><br/>
      <sub>Google Gemini 기반<br/>정확한 도면 인식</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/3d-select-face.png" width="48"/><br/>
      <b>실시간 3D 시각화</b><br/>
      <sub>Three.js 기반<br/>인터랙티브 뷰어</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/download.png" width="48"/><br/>
      <b>다양한 내보내기</b><br/>
      <sub>glTF, OBJ, STL<br/>IFC, CSV, JSON</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/dashboard-layout.png" width="48"/><br/>
      <b>관리자 대시보드</b><br/>
      <sub>프롬프트 편집<br/>분석 통계</sub>
    </td>
  </tr>
</table>

---

## 🔄 6단계 AI 변환 파이프라인

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Phase 1   │───▶│   Phase 2   │───▶│   Phase 3   │
│  좌표계 설정 │    │  구조 추출  │    │  개구부 인식 │
│  (OCR 분석) │    │ (벽, 기둥) │    │ (문, 창문) │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
       ┌──────────────────────────────────────┘
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Phase 4   │───▶│   Phase 5   │───▶│   Phase 6   │
│  공간 분석  │    │  치수 계산  │    │ Master JSON │
│ (실별 구분) │    │ (px→mm)   │    │ (3D 좌표)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

| Phase | 역할 | 설명 |
|:-----:|------|------|
| **1** | 좌표계 정규화 | 도면의 방향, 축척, 기준점 설정 |
| **2** | 구조 추출 | 벽체, 기둥 등 구조 요소 인식 |
| **3** | 개구부 인식 | 문, 창문 위치 및 크기 파악 |
| **4** | 공간 분석 | 실별 경계 및 용도 분류 |
| **5** | 치수 계산 | 픽셀 → 실제 치수(mm) 변환 |
| **6** | Master JSON | 최종 3D BIM 데이터 생성 |

---

## 📖 사용 방법

### Step 1️⃣ 도면 업로드
- 2D 건축 도면 이미지를 **드래그 앤 드롭** 또는 파일 선택
- 지원 형식: `PNG`, `JPEG`, `WebP` (최대 10MB)

### Step 2️⃣ AI 분석 실행
- **"분석 시작"** 버튼 클릭
- 6단계 파이프라인 자동 실행 (약 30초~1분)

### Step 3️⃣ 결과 확인
- Phase별 상세 결과 JSON 조회
- 구조화된 데이터 뷰어

### Step 4️⃣ 3D 모델 확인
- 인터랙티브 3D 뷰어에서 모델 확인
- 마우스로 회전/이동/줌 조작
- 요소 클릭 시 상세 정보 표시

### Step 5️⃣ 데이터 내보내기
| 형식 | 용도 |
|------|------|
| **glTF/GLB** | 웹 3D 뷰어, Unity, Unreal |
| **OBJ** | 3ds Max, Maya, Blender |
| **STL** | 3D 프린팅 |
| **IFC-like** | BIM 소프트웨어 연동 |
| **CSV** | Excel 데이터 분석 |
| **JSON** | API 연동, 데이터 저장 |

---

## 🛠️ 로컬 개발 환경 설정

### 필수 요구사항

- **Node.js** 18.17 이상
- **npm** 또는 **yarn**
- **Google AI API 키** ([발급하기](https://makersuite.google.com/app/apikey))
- **Vercel Blob Token** (선택)

### 설치 방법

```bash
# 1. 저장소 클론
git clone https://github.com/DongHyeok-Bae/2Dto3D
cd 2dto3d/2dto3d_ver0

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
```

`.env.local` 파일 설정:
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
ADMIN_SESSION_SECRET=your_secret_key
```

```bash
# 4. 개발 서버 실행
npm run dev
```

🌐 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🏗️ 프로젝트 구조

```
2dto3d_ver0/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (main)/             # 메인 서비스 페이지
│   ├── 📁 admin/              # 관리자 대시보드
│   │   ├── 📁 analytics/      # 분석 대시보드
│   │   └── 📁 prompts/        # 프롬프트 관리
│   ├── 📁 api/                # API 엔드포인트
│   │   ├── 📁 pipeline/       # Phase 1-6 API
│   │   ├── 📁 admin/          # 관리자 API
│   │   └── 📁 auth/           # 인증 API
│   └── 📁 login/              # 로그인 페이지
├── 📁 components/              # React 컴포넌트
│   ├── 📁 upload/             # 이미지 업로더
│   ├── 📁 pipeline/           # 파이프라인 실행 UI
│   ├── 📁 results/            # 결과 뷰어
│   ├── 📁 viewer/             # 3D 뷰어 (Three.js)
│   ├── 📁 export/             # 내보내기 패널
│   ├── 📁 analytics/          # 분석 차트
│   └── 📁 auth/               # 인증 컴포넌트
├── 📁 lib/                     # 핵심 유틸리티
│   ├── 📁 ai/                 # Gemini API 클라이언트
│   ├── 📁 three/              # 3D 씬 빌더
│   ├── 📁 export/             # 내보내기 유틸
│   ├── 📁 analytics/          # 분석 추적
│   ├── 📁 auth/               # 세션 관리
│   └── 📁 validation/         # Zod 스키마
├── 📁 store/                   # Zustand 상태 관리
├── 📁 types/                   # TypeScript 타입
└── 📁 public/                  # 정적 파일
```

---

## 🎨 기술 스택

<table>
  <tr>
    <th>분류</th>
    <th>기술</th>
  </tr>
  <tr>
    <td><b>Frontend</b></td>
    <td>
      <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js"/>
      <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react"/>
      <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript"/>
      <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?style=flat-square&logo=tailwindcss"/>
    </td>
  </tr>
  <tr>
    <td><b>3D Graphics</b></td>
    <td>
      <img src="https://img.shields.io/badge/Three.js-r160-black?style=flat-square&logo=three.js"/>
      <img src="https://img.shields.io/badge/React_Three_Fiber-8-black?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <td><b>AI</b></td>
    <td>
      <img src="https://img.shields.io/badge/Google_Gemini-1.5_Pro-4285F4?style=flat-square&logo=google"/>
    </td>
  </tr>
  <tr>
    <td><b>State</b></td>
    <td>
      <img src="https://img.shields.io/badge/Zustand-4.5-brown?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <td><b>Backend</b></td>
    <td>
      <img src="https://img.shields.io/badge/Vercel_Blob-Storage-black?style=flat-square&logo=vercel"/>
      <img src="https://img.shields.io/badge/Zod-Validation-3E67B1?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <td><b>UI</b></td>
    <td>
      <img src="https://img.shields.io/badge/Monaco_Editor-Code-007ACC?style=flat-square"/>
      <img src="https://img.shields.io/badge/Recharts-Charts-FF6384?style=flat-square"/>
      <img src="https://img.shields.io/badge/Framer_Motion-Animation-FF0055?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <td><b>Deployment</b></td>
    <td>
      <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel"/>
    </td>
  </tr>
</table>

---

## 📚 스크립트 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run type-check` | TypeScript 타입 체크 |

---

## 🎯 개발 로드맵

- [x] **Phase 0**: 프로젝트 초기 설정
- [x] **Phase 1**: 프롬프트 관리 인프라 (Vercel Blob Storage)
- [x] **Phase 2**: 관리자 대시보드 (Monaco Editor)
- [x] **Phase 3**: AI 파이프라인 구현 (Gemini API)
- [x] **Phase 4**: 사용자 인터페이스 (업로드, 결과 뷰어)
- [x] **Phase 5**: 3D 뷰어 구현 (Three.js)
- [x] **Phase 6**: 편집 및 내보내기 (glTF, OBJ, STL, IFC)
- [x] **Phase 7**: 최적화 및 배포 (SEO, 성능)
- [x] **Phase 8**: 분석 대시보드 (DAU, API 호출, 에러율)
- [x] **Phase 9**: 관리자 인증 시스템 (로그인/로그아웃)

---

## 📝 라이선스

MIT License

---

## 👥 팀

**건축공학시스템설계** (경희대학교 건축공학과)

| 역할 | 이름 |
|------|------|
| 담당교수 | 백장운 |
| 팀장 | 배동혁 |
| 팀원 | 김규백, 정성준, 최지웅 |

## 📞 문의

- kkt: dhbae07
- Email: dhbae07@naver.com

## 🙏 감사의 말

- **백장운 교수님** - 건축공학시스템설계 담당교수
- **Claude Code** - AI 개발 도우미
- **Google Gemini AI** - 도면 분석 AI 엔진
- **경희대학교 건축공학과**

---

<div align="center">
  Made with ❤️ by 경희대학교 건축공학과 × 2Dto3D Team

  **건축공학시스템설계 (2025)**

  팀원: 김규백, 배동혁, 정성준, 최지웅
</div>
