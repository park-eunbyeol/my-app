---
description: 프로덕션 빌드 및 배포
---

# 프로덕션 빌드 및 배포 워크플로우

## 1. 프로덕션 빌드 생성
```bash
npm run build
```

## 2. 빌드 결과 로컬 테스트
```bash
npm start
```

## 3. Vercel 배포 (자동)
- GitHub에 push하면 자동으로 Vercel에 배포됩니다
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

## 4. Vercel 수동 배포
```bash
npx vercel
```

## 5. Vercel 프로덕션 배포
```bash
npx vercel --prod
```
