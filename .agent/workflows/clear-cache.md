---
description: 캐시 및 빌드 파일 정리
---

# 캐시 정리 워크플로우

## 1. Next.js 캐시 삭제
```bash
Remove-Item -Recurse -Force .next
```

## 2. node_modules 재설치
```bash
Remove-Item -Recurse -Force node_modules
npm install
```

## 3. 브라우저 localStorage 초기화
개발자 도구 Console에서:
```javascript
localStorage.clear();
location.reload();
```

## 4. 특정 localStorage 항목만 삭제
```javascript
localStorage.removeItem('cafe-campaigns-v2');
localStorage.removeItem('cafe-applicants-v2');
localStorage.removeItem('cafe-reviews-v2');
localStorage.removeItem('cafe-messages-v2');
location.reload();
```

// turbo
## 5. 개발 서버 재시작
```bash
npm run dev
```
