# components/auth - 인증 컴포넌트

**생성일**: 2024-12-08
**Phase**: 9 - 관리자 인증 시스템

## 📌 목적
인증 관련 UI 컴포넌트

## 📁 컴포넌트 목록

### `LogoutButton.tsx`
로그아웃 버튼 컴포넌트 (Client Component)

#### 특징:
- `'use client'` 지시어 사용
- 관리자 네비게이션에 배치
- 로그아웃 API 호출 후 홈으로 리다이렉트

#### 상태:
- `isLoading`: 로그아웃 처리 중 상태

#### 스타일:
- 텍스트: 흰색/반투명 → 호버 시 흰색
- 배경: 호버 시 빨간색/반투명
- 전환: transition-colors

#### 동작:
1. 버튼 클릭
2. `/api/auth/logout` POST 호출
3. 성공 시 → `/`로 리다이렉트 + router.refresh()
4. 실패 시 → react-hot-toast 에러 표시

#### 사용 예시:
```tsx
import LogoutButton from '@/components/auth/LogoutButton'

// app/admin/layout.tsx에서
<nav>
  <div className="flex items-center gap-6">
    <NavLink href="/admin/prompts">프롬프트 관리</NavLink>
    <NavLink href="/admin/results">실행 결과</NavLink>
    <NavLink href="/admin/analytics">분석</NavLink>
    <div className="border-l border-white/20 h-6 mx-2" />
    <LogoutButton />
  </div>
</nav>
```

## 🔧 Props

### LogoutButton
Props 없음 (독립 컴포넌트)

## 📝 사용 라이브러리

- `next/navigation`: useRouter
- `react-hot-toast`: 알림 메시지
