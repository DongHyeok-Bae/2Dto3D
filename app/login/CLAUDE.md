# app/login - 로그인 페이지

**생성일**: 2024-12-08
**Phase**: 9 - 관리자 인증 시스템

## 📌 목적
관리자 로그인을 위한 UI 페이지

## 📁 파일 구조

```
app/login/
└── page.tsx    # 로그인 페이지
```

## 🎨 UI 디자인

### 레이아웃
- 중앙 정렬 (flexbox)
- 최대 너비: md (28rem)
- 배경: neutral-marble

### 컴포넌트
- **로고**: 2Dto3D 로고 + 텍스트
- **로그인 카드**: 흰색 배경, rounded-neo, shadow-neo-lg
- **입력 필드**: 아이디, 비밀번호
- **버튼**: Primary Navy 배경
- **링크**: 홈으로 돌아가기

### 색상
- Primary Navy: #1A2B50 (버튼, 타이틀)
- Neutral Marble: #F9FAFB (배경)
- Neutral Silver: 입력 필드 테두리

## 🔧 기능

### 상태 관리
- `username`: 아이디 입력값
- `password`: 비밀번호 입력값
- `isLoading`: 로딩 상태

### 로그인 플로우
1. 아이디/비밀번호 입력
2. "로그인" 버튼 클릭
3. `/api/auth/login` API 호출
4. 성공 시 → `/admin`으로 리다이렉트
5. 실패 시 → react-hot-toast로 에러 표시

### 에러 처리
- 입력값 누락: "아이디와 비밀번호를 입력해주세요."
- 인증 실패: API 응답의 에러 메시지 표시
- 네트워크 오류: "로그인 처리 중 오류가 발생했습니다."

## 📝 사용 라이브러리

- `next/navigation`: useRouter (리다이렉트)
- `next/image`: 로고 이미지
- `react-hot-toast`: 알림 메시지
