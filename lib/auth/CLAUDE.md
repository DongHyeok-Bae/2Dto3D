# lib/auth - 인증 유틸리티

**생성일**: 2024-12-08
**Phase**: 9 - 관리자 인증 시스템

## 📌 목적
관리자 인증을 위한 세션 관리 유틸리티

## 📁 파일 구조

```
lib/auth/
└── session.ts    # 세션 토큰 생성/검증
```

## 🔧 주요 기능

### `session.ts`
세션 관리 유틸리티

#### 상수:
- `SESSION_COOKIE_NAME`: 쿠키 이름 (`admin_session`)
- `SESSION_MAX_AGE`: 세션 유효 시간 (24시간)

#### 함수:

**`generateSessionToken(username: string): string`**
- SHA-256 해시 기반 세션 토큰 생성
- 시간 기반 (1시간 단위)으로 토큰 갱신

**`verifySessionToken(token: string): boolean`**
- 토큰 유효성 검증
- 현재/이전 시간대 토큰 모두 허용 (경계 케이스 처리)

**`validateCredentials(username: string, password: string): boolean`**
- 환경변수의 자격증명과 비교
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` 사용

**`setSessionCookie(username: string): Promise<void>`**
- httpOnly 쿠키 설정
- secure (프로덕션), sameSite: lax

**`clearSessionCookie(): Promise<void>`**
- 세션 쿠키 삭제 (로그아웃)

**`getSessionToken(): Promise<string | undefined>`**
- 현재 세션 토큰 조회

**`isAuthenticated(): Promise<boolean>`**
- 인증 상태 확인

## 🔒 보안 특징

- httpOnly 쿠키 (XSS 방지)
- secure 플래그 (프로덕션 HTTPS)
- sameSite: lax (CSRF 기본 방지)
- 시간 기반 토큰 (1시간 단위 자동 갱신)

## 📝 환경변수

```env
ADMIN_USERNAME=관리자_아이디
ADMIN_PASSWORD=관리자_비밀번호
ADMIN_SESSION_SECRET=세션_암호화_키
```
