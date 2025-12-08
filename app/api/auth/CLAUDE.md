# app/api/auth - 인증 API

**생성일**: 2024-12-08
**Phase**: 9 - 관리자 인증 시스템

## 📌 목적
관리자 로그인/로그아웃 API 엔드포인트

## 📁 API 구조

```
app/api/auth/
├── login/
│   └── route.ts    # 로그인 API
└── logout/
    └── route.ts    # 로그아웃 API
```

## 🔧 API 엔드포인트

### `/api/auth/login`
관리자 로그인

#### POST - 로그인
```typescript
POST /api/auth/login

Body:
{
  username: string,
  password: string
}

Response (성공):
{
  success: true,
  message: "로그인 성공"
}

Response (실패):
{
  error: "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

#### 상태 코드:
- `200`: 로그인 성공 (세션 쿠키 설정)
- `400`: 입력값 누락
- `401`: 인증 실패
- `500`: 서버 오류

---

### `/api/auth/logout`
관리자 로그아웃

#### POST - 로그아웃
```typescript
POST /api/auth/logout

Response:
{
  success: true,
  message: "로그아웃 성공"
}
```

#### 상태 코드:
- `200`: 로그아웃 성공 (세션 쿠키 삭제)
- `500`: 서버 오류

## 🔒 보안

- 세션 쿠키: httpOnly, secure, sameSite: lax
- 환경변수에서 자격증명 로드
- 에러 메시지에 민감한 정보 노출 안함

## 📝 사용 예시

```typescript
// 로그인
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password' })
})

// 로그아웃
await fetch('/api/auth/logout', { method: 'POST' })
```
