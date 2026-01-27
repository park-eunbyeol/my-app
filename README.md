# ☕ CAFÉ DREAM

**사장님의 여유를 위한 카페 마케팅 전문가**

텅 빈 테이블을 웨이팅 라인으로 만드는 단골 마케팅의 정석. 네이버 플레이스, 인스타그램, CRM까지 카페 매출의 모든 솔루션을 제공합니다.

![CAFÉ DREAM](public/og-image.png)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [환경 변수 설정](#-환경-변수-설정)
- [배포](#-배포)
- [주요 페이지](#-주요-페이지)

## 🎯 프로젝트 소개

CAFÉ DREAM은 카페 사장님들을 위한 올인원 마케팅 솔루션 플랫폼입니다. 지도 노출부터 단골 관리까지, 카페 운영에 필요한 모든 마케팅 기능을 하나의 플랫폼에서 제공합니다.

### 핵심 가치

- 🎯 **지역 기반 정밀 타겟팅**: 실제 방문 가능성 높은 고객만 모셔옵니다
- 📊 **데이터 기반 의사결정**: 네이버 플레이스 순위 분석 및 경쟁 업체 광고 현황 진단
- 🤖 **자동화된 마케팅**: 인스타그램 관리부터 쿠폰 발송까지 자동화
- 💰 **투명한 성과 측정**: 실시간 방문객 증가율 및 매출 향상 리포트

## ✨ 주요 기능

### 1. 랜딩 페이지
- 반응형 디자인으로 모바일/데스크톱 최적화
- 실시간 통계 및 성과 지표 시각화
- AI 기반 카페 진단 챗봇
- 3가지 요금제 (베이직/프로/프리미엄)

### 2. 대시보드
- 실시간 카페 운영 현황 모니터링
- 카카오맵 기반 상권 분석
- AI 마케팅 전략 생성 (네이버 검색 API 연동)
- 방문객 통계 및 트렌드 분석

### 3. 인스타그램 핫플레이스
- 인스타그램 스타일 피드 UI
- 실제 카페 사진 갤러리
- 좋아요, 댓글, 공유 기능
- 릴스(Reels) 동영상 지원

### 4. 로컬 체험단 운영
- 인플루언서 매칭 시스템
- 체험단 신청 및 관리
- 성과 리포트 및 통계
- 3단계 운영 프로세스 안내

### 5. 카카오톡 채널 관리
- 카카오톡 채널 연동 상태 관리
- 대량 메시지 발송 기능
- 발송 이력 및 통계
- 채널 설정 편집

### 6. 결제 시스템
- 토스페이먼츠 연동
- 3가지 요금제별 결제
- 결제 성공/실패 페이지
- 안전한 결제 프로세스

### 7. 회원 관리
- Supabase 기반 인증 시스템
- 이메일/비밀번호 로그인
- 회원가입 및 프로필 관리
- 세션 관리 및 자동 로그인

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion 12.27.1
- **UI Components**: Custom React Components

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes

### External APIs & Services
- **지도**: Kakao Maps API
- **검색**: Naver Search API
- **결제**: TossPayments SDK 2.5.0
- **이메일**: Resend 6.7.0
- **뉴스레터**: Stibee API
- **AI**: OpenAI API 6.16.0

### DevOps & Deployment
- **Hosting**: Vercel
- **Version Control**: Git/GitHub
- **Package Manager**: npm

## 🚀 시작하기

### 필수 요구사항

- Node.js 20 이상
- npm 또는 yarn
- Git

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/park-eunbyeol/my-app.git
cd my-app
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다. ([환경 변수 설정](#-환경-변수-설정) 참조)

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 확인**
[http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 빌드 및 프로덕션 실행

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
my-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 관련 API
│   │   ├── naver/                # 네이버 API 프록시
│   │   ├── stibee/               # Stibee 뉴스레터 API
│   │   └── users/                # 사용자 관리 API
│   ├── dashboard/                # 대시보드 페이지
│   ├── hotplace/                 # 인스타그램 핫플레이스
│   ├── kakao-management/         # 카카오톡 채널 관리
│   ├── local-experience/         # 로컬 체험단 페이지
│   ├── payment/                  # 결제 관련 페이지
│   │   ├── success/              # 결제 성공
│   │   └── fail/                 # 결제 실패
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 메인 랜딩 페이지
│   └── globals.css               # 글로벌 스타일
├── components/                   # 재사용 가능한 컴포넌트
│   ├── KakaoMap.tsx              # 카카오맵 컴포넌트
│   └── TossPaymentWidget.tsx    # 토스페이먼츠 위젯
├── lib/                          # 유틸리티 및 라이브러리
│   ├── supabase.ts               # Supabase 클라이언트
│   └── openai.ts                 # OpenAI 클라이언트
├── public/                       # 정적 파일
│   ├── images/                   # 이미지 파일
│   ├── hotplace/                 # 핫플레이스 이미지
│   ├── og-image.png              # Open Graph 이미지
│   └── favicon.png               # 파비콘
├── supabase/                     # Supabase 설정
│   └── migrations/               # 데이터베이스 마이그레이션
├── .env.local                    # 환경 변수 (gitignore)
├── package.json                  # 프로젝트 의존성
├── tsconfig.json                 # TypeScript 설정
├── tailwind.config.ts            # Tailwind CSS 설정
└── next.config.ts                # Next.js 설정
```

## 🔐 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_key

# Naver API
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# TossPayments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stibee (Newsletter)
STIBEE_API_KEY=your_stibee_api_key
STIBEE_LIST_ID=your_stibee_list_id

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
```

### API 키 발급 방법

- **Supabase**: [supabase.com](https://supabase.com)에서 프로젝트 생성
- **Kakao Maps**: [Kakao Developers](https://developers.kakao.com)에서 앱 등록
- **Naver API**: [Naver Developers](https://developers.naver.com)에서 애플리케이션 등록
- **TossPayments**: [TossPayments](https://www.tosspayments.com)에서 가맹점 등록
- **OpenAI**: [OpenAI Platform](https://platform.openai.com)에서 API 키 발급
- **Stibee**: [Stibee](https://stibee.com)에서 계정 생성
- **Resend**: [Resend](https://resend.com)에서 API 키 발급

## 🌐 배포

### Vercel 배포

1. **GitHub 저장소 연결**
   - [Vercel](https://vercel.com)에 로그인
   - "New Project" 클릭
   - GitHub 저장소 선택

2. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 환경 변수 추가
   - `.env.local`의 모든 변수를 추가

3. **자동 배포**
   - `main` 브랜치에 푸시하면 자동으로 배포됩니다

### 배포 URL
- **Production**: https://my-app-omega-fawn-50.vercel.app

## 📄 주요 페이지

### 1. 메인 랜딩 페이지 (`/`)
- 서비스 소개 및 주요 기능 안내
- 요금제 비교 및 선택
- AI 진단 챗봇
- 뉴스레터 구독
- 회원가입/로그인

### 2. 대시보드 (`/dashboard`)
- 카페 운영 현황 대시보드
- 카카오맵 기반 상권 분석
- AI 마케팅 전략 생성
- 실시간 통계 및 차트

### 3. 인스타그램 핫플레이스 (`/hotplace`)
- 인스타그램 스타일 피드
- 카페 사진 갤러리
- 릴스 동영상
- 소셜 인터랙션

### 4. 로컬 체험단 (`/local-experience`)
- 인플루언서 소개
- 체험단 신청
- 운영 프로세스 안내
- 성과 통계

### 5. 카카오톡 채널 관리 (`/kakao-management`)
- 채널 연동 관리
- 대량 메시지 발송
- 발송 이력 조회
- 채널 설정

### 6. 결제 페이지
- `/payment/success`: 결제 성공
- `/payment/fail`: 결제 실패

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: Amber (#F59E0B)
- **Secondary**: Orange (#EA580C)
- **Dark**: #1A1A1A
- **Light**: #FAFAFA

### 타이포그래피
- **Heading**: Pretendard (Bold, Black)
- **Body**: Pretendard (Regular, Medium)
- **Accent**: Cormorant Garamond (Italic)

### 반응형 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🧪 테스트

```bash
# 린트 실행
npm run lint

# 타입 체크
npx tsc --noEmit
```

## 📝 라이선스

이 프로젝트는 개인 프로젝트이며, 상업적 사용을 금지합니다.

## 👥 개발자

- **박은별** - [GitHub](https://github.com/park-eunbyeol)

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ☕ by CAFÉ DREAM Team**
