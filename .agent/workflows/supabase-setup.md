---
description: Supabase 데이터베이스 설정
---

# Supabase 설정 워크플로우

## 1. 환경 변수 확인
`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Supabase 프로젝트 확인
- https://supabase.com 에서 프로젝트 상태 확인
- Database 탭에서 테이블 구조 확인

## 3. 마이그레이션 실행 (필요시)
SQL Editor에서 스키마 변경 사항 적용

## 4. 로컬 개발 환경에서 테스트
```bash
npm run dev
```
- 회원가입/로그인 기능 테스트
- 데이터 저장 기능 테스트
