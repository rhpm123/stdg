# PostgreSQL 직접 연결 방식으로 틀린그림찾기 앱 개발하기

## 접근법 변경 배경

초기 계획은 Supabase MCP 서버를 통해 모든 기능(데이터베이스, 스토리지, 인증 등)을 통합적으로 사용하는 것이었으나, MCP 서버 연결 문제로 인해 PostgreSQL 직접 연결 방식으로 전환하게 되었습니다. 이에 따라 일부 태스크의 접근 방식을 수정했습니다.

## 주요 변경 사항

1. **이미지 저장 방식**
   - 기존: Supabase Storage API를 통한 프로그래매틱 업로드/다운로드
   - 변경: Supabase 대시보드를 통한 수동 업로드 + URL 참조 방식

2. **이미지 관리 UI**
   - 기존: 웹앱에서 직접 이미지 업로드 인터페이스 제공
   - 변경: 이미지 URL과 메타데이터만 입력하는 간소화된 UI

3. **데이터 흐름**
   - 기존: 웹앱 → Supabase Storage → 이미지 처리 → Supabase 데이터베이스
   - 변경: 수동 업로드 → Supabase Storage → URL 획득 → 웹앱에 URL 입력 → 이미지 처리 → PostgreSQL 데이터베이스

## 구현 가이드

### 1. 이미지 관리 워크플로우

1. Supabase 대시보드에 로그인
2. Storage 섹션에서 이미지 수동 업로드 (원본/수정 이미지)
3. 업로드된 이미지의 Public URL 획득
4. 웹앱의 관리자 UI에서 이미지 URL과 메타데이터 입력
5. PostgreSQL 데이터베이스에 URL 및 메타데이터 저장

### 2. 이미지 처리 워크플로우

1. 웹앱에서 이미지 URL 로드
2. 이미지 차이점 분석 알고리즘 실행
3. 좌표 데이터 추출 및 PostgreSQL 데이터베이스에 저장

### 3. 게임 플레이 워크플로우

1. 사용자가 게임 접속
2. PostgreSQL에서 이미지 URL 및 메타데이터 로드
3. 이미지 표시 및 게임 로직 실행
4. 사용자 진행 상황 PostgreSQL에 저장

## 장점 및 단점

### 장점
- 데이터베이스 기능을 그대로 사용 가능
- 핵심 게임 로직은 변경 없이 유지 가능
- 간단한 시스템 구조

### 단점
- 이미지 업로드 과정이 수동적
- 대량의 이미지 관리가 어려움
- 이미지 처리 자동화가 제한적

## 향후 개선 방안

MCP 서버 연결 문제가 해결되면 다시 완전한 Supabase API 방식으로 전환하는 것을 고려할 수 있습니다. 이 경우 이미 구현된 데이터베이스 구조와 게임 로직은 그대로 유지하면서, 이미지 관리 부분만 자동화된 API 방식으로 업그레이드할 수 있습니다. 