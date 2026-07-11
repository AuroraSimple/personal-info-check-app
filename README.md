# 🔍 PII (Personally Identifiable Information) Checker

개인정보 검사 애플리케이션 - 텍스트에 포함된 개인정보를 자동으로 감지하고 강조합니다.

## 🎯 기능

- **이메일 감지** - Email 주소 자동 탐지
- **전화번호 감지** - 다양한 형식의 전화번호 인식
- **SSN 감지** - 사회보장번호 (123-45-6789 형식)
- **신용카드 감지** - 신용카드 번호 패턴 인식
- **이름 감지** - 인명 패턴 감지
- **신뢰도 점수** - 각 감지 항목의 신뢰도 표시
- **실시간 강조** - 감지된 정보를 색상으로 강조

## 🏗️ 프로젝트 구조

```
personal-info-check-app/
├── backend/              # Express.js API 서버
│   ├── src/
│   │   ├── index.ts      # 메인 서버 설정
│   │   ├── detectors/    # PII 감지 로직
│   │   ├── middleware/   # Rate limiting 등
│   │   ├── routes/       # API 라우트
│   │   └── schemas/      # Zod 검증 스키마
│   └── package.json
│
└── frontend/             # React + Vite 앱
    ├── src/
    │   ├── App.tsx       # 메인 UI 컴포넌트
    │   ├── main.tsx      # 진입점
    │   └── index.css     # Tailwind CSS
    └── package.json
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# Backend 의존성 설치
cd backend && npm install

# Frontend 의존성 설치
cd ../frontend && npm install
```

### 개발 서버 실행

```bash
# Terminal 1: Backend (포트 3000)
cd backend && npm run dev

# Terminal 2: Frontend (포트 5173)
cd frontend && npm run dev
```

브라우저에서 http://localhost:5173 접속

## 📡 API 사용

### POST /api/check

개인정보 검사 요청

**요청:**
```bash
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My email is john@example.com and phone is 555-123-4567"
  }'
```

**응답:**
```json
{
  "hasPII": true,
  "detections": [
    {
      "type": "email",
      "value": "john@example.com",
      "position": { "start": 12, "end": 30 },
      "confidence": 0.95
    },
    {
      "type": "phone",
      "value": "555-123-4567",
      "position": { "start": 45, "end": 57 },
      "confidence": 0.85
    }
  ],
  "summary": {
    "totalFound": 2,
    "byType": { "email": 1, "phone": 1 }
  }
}
```

## 🔒 보안 기능

- **Helmet.js** - HTTP 헤더 보안
- **CORS** - 크로스 오리진 요청 제어
- **Rate Limiting** - API 요청 제한 (분당 30회, 15분당 100회)
- **입력 검증** - Zod를 사용한 스키마 검증
- **데이터 보호** - 모든 검사는 로컬에서 처리됨

## 🛠️ 기술 스택

**Backend:**
- Express.js
- TypeScript
- Zod (검증)
- Helmet (보안)
- Express Rate Limit

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Hook Form
- Axios

## 📝 License

MIT

## 🤝 기여

이슈와 풀 리퀘스트 환영합니다!
