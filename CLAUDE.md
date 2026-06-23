# 프로젝트 개요
반도체/디스플레이 기술 블로그 큐레이션 사이트

## 스택
- React + TypeScript
- Supabase (DB)
- Vercel (배포)
- Claude API (요약 + 태그 생성)

## 스타일링
- styled-components

## 핵심 기능
- 3단계 계층 드롭다운 필터
  - 1depth: 상위기술 (반도체, 디스플레이)
  - 2depth: 세부기술 (HBM, NAND, DRAM 등)
  - 3depth: 소스유형 (공식블로그, 기술아티클, 소비자리뷰)
- 자동 크롤링
- 최신순 글 목록
- 별도 기사 스크랩 확장 프로그램 추가

## MVP 타겟 소스
- 삼성반도체 뉴스룸 (news.samsungsemiconductor.com/kr)
- SK하이닉스 뉴스룸 (news.skhynix.co.kr)

## MVP 범위 외
- 퀴즈 기능 (읽은 글 기반 문제 생성)
- URL 입력 → AI 요약 + 해시태그 자동 생성
