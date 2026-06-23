# Semis

반도체·디스플레이 기술 블로그 큐레이션 서비스

## 기능

- **자동 크롤링** — 삼성반도체 뉴스룸, SK하이닉스 뉴스룸, 삼성 기술 블로그 RSS/Sitemap 기반 매일 자동 수집
- **3단계 필터** — 분야 / 세부기술 / 소스유형 / 기업별 필터링
- **읽음 처리** — 읽은 글은 하단으로, 안읽은 글 수 표시
- **문구 북마크** — 기사에서 저장하고 싶은 문구를 링크와 함께 보관
- **Semis Clipper** — 브라우저 확장으로 외부 기사 바로 저장
- **URL 직접 추가** — 원하는 기사 URL 입력 시 메타태그 자동 파싱

## 스택

- React + TypeScript
- Supabase (DB + Edge Functions + pg_cron)
- styled-components

## 로컬 실행

```bash
npm install
npm start
```

`.env.local` 파일에 아래 값 설정 필요:

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

## 브라우저 확장 설치

1. `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. 압축 해제된 확장 로드 → `extension/` 폴더 선택
