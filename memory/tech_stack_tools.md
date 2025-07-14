# 기술 스택 및 개발 도구 현황

## Frontend 기술 스택

### 핵심 기술
- **HTML5**: 시맨틱 마크업 기반 구조
- **CSS3**: Grid, Flexbox 기반 반응형 레이아웃  
- **Vanilla JavaScript**: ES6+ 문법, 모듈 패턴 활용
- **Progressive Web App**: 모바일 최적화

### CSS 아키텍처 (모듈화 구조)
```
assets/css/game/
├── variables.css      (118라인) - CSS 변수 정의
├── base.css          (204라인) - 기본 스타일
├── layout.css        (170라인) - 레이아웃 구조
├── components.css    (960라인) - UI 컴포넌트
├── responsive.css    (856라인) - 반응형 스타일
├── animations.css    (503라인) - 애니메이션 효과
├── orientation.css   (273라인) - 화면 방향 대응
└── health-bar.css    (510라인) - 게임 UI 전용
```

**설계 원칙:**
- CSS Grid 기반 반응형 레이아웃
- 컴포넌트 기반 모듈 분리
- CSS 변수 활용한 테마 시스템
- 모바일 우선 반응형 설계

### JavaScript 아키텍처 (기능별 모듈)
```
assets/js/
├── game-logic.js           (864라인) - 핵심 게임 로직
├── game-state.js           (267라인) - 상태 관리
├── orientation-controller.js (1170라인) - 화면 방향 제어
├── bottom-bar-manager.js   (149라인) - UI 하단 바 관리
├── answer-display.js       (517라인) - 정답 표시 시스템
├── click-handler.js        (548라인) - 클릭 이벤트 처리
├── health-bar-system.js    (295라인) - 체력 시스템
├── heart-system.js         (90라인) - 하트 관리
├── coordinate-utils.js     (188라인) - 좌표 유틸리티
├── api-client.js           (153라인) - API 통신
├── cache-buster.js         (440라인) - 캐시 관리
├── emergency-css-injection.js (328라인) - CSS 응급 주입
└── force-js-execution.js   (309라인) - JS 강제 실행
```

**설계 원칙:**
- 단일 책임 원칙 기반 모듈 분리
- 이벤트 기반 아키텍처
- 상태 관리 중앙화
- 유틸리티 함수 재사용

---

## Backend 및 인프라

### 데이터베이스 (Supabase)
```javascript
// 환경변수 기반 연결
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

**주요 기능:**
- PostgreSQL 기반 관계형 데이터베이스
- 실시간 구독 (Real-time subscriptions)
- Row Level Security (RLS) 적용
- 자동 API 생성

### 인증 시스템
- **Google OAuth**: 소셜 로그인
- **Supabase Auth**: 세션 관리
- **JWT 토큰**: 보안 인증

### 설정 관리 구조
```
config/
├── supabase.js      (465라인) - Supabase 클라이언트 설정
├── database.js      (8라인) - DB 연결 설정  
├── storage.js       (51라인) - 스토리지 설정
└── public-config.js (13라인) - 공개 설정
```

---

## 개발 도구 및 MCP 통합

### MCP (Model Context Protocol) 도구

#### 1. Shrimp Task Manager
**용도**: 작업 계획 및 실행 관리
```
기능:
- plan_task: 작업 계획 수립
- execute_task: 작업 실행
- verify_task: 작업 검증
- split_tasks: 작업 분할
- analyze_task: 요구사항 분석
```

**사용 패턴:**
- TaskPlanner 모드: 새 기능 계획 수립
- TaskExecutor 모드: 개발 작업 실행
- 연속 실행 모드: 다중 작업 자동화

#### 2. MCP Git 도구
**용도**: 버전 관리 및 커밋 자동화
```
주요 명령:
- git_status: 저장소 상태 확인
- git_add: 파일 스테이징
- git_commit: 커밋 생성
- git_diff: 변경사항 확인
```

#### 3. edit-file-lines 도구
**용도**: 정밀한 파일 편집
```
주요 기능:
- 라인 단위 정확한 수정
- dryRun 모드로 미리보기
- strMatch/regexMatch 패턴 매칭
- approve_edit로 변경사항 적용
```

**사용 원칙:**
- 항상 dryRun: true로 미리보기
- 파일 수정 전 주변 라인 확인
- 한 번에 3-5개 섹션으로 분할 작업

#### 4. 터미널 명령어 도구
**용도**: 시스템 명령 실행
```
주요 활용:
- npm 패키지 관리
- 서버 실행 및 테스트
- 파일 시스템 조작
- 성능 테스트 도구 실행
```

---

## 아키텍처 패턴

### 1. 모듈화 패턴
**CSS 모듈화:**
- variables.css → 중앙 집중식 변수 관리
- 기능별 CSS 파일 분리
- 의존성 최소화

**JavaScript 모듈화:**
- 단일 책임 원칙
- 명확한 인터페이스 정의
- 이벤트 기반 통신

### 2. 상태 관리 패턴
```javascript
// game-state.js 중심의 상태 관리
const gameState = {
  currentLevel: 1,
  score: 0,
  lives: 3,
  timeRemaining: 300
};
```

### 3. API 통신 패턴
```javascript
// api-client.js 중심의 API 추상화
class APIClient {
  async saveScore(score) { ... }
  async getImageSets() { ... }
  async submitAnswer(coordinates) { ... }
}
```

### 4. 반응형 설계 패턴
```css
/* Mobile First 접근 */
.bottom-bar {
  grid-template-columns: 50% 30% 20%; /* 기본 */
}

@media (min-width: 768px) {
  .bottom-bar {
    grid-template-columns: var(--grid-stats-ratio) 
                          var(--grid-progress-ratio) 
                          var(--grid-controls-ratio);
  }
}
```

---

## 개발 워크플로우

### 1. 작업 계획 단계
1. Shrimp Task Manager로 요구사항 분석
2. plan_task로 작업 목록 생성
3. split_tasks로 세부 작업 분할

### 2. 개발 실행 단계
1. execute_task로 개별 작업 실행
2. edit-file-lines로 코드 수정
3. Git 도구로 변경사항 커밋

### 3. 검증 및 완료
1. verify_task로 작업 검증
2. 기능 테스트 및 회귀 테스트
3. complete_task로 작업 완료

### 4. 품질 관리
- 코드 리뷰를 위한 Git 히스토리 관리
- CSS/JS 모듈화 원칙 준수
- 반응형 디자인 검증

---

## 성능 최적화 도구

### 1. 캐시 관리
- **cache-buster.js**: 브라우저 캐시 관리
- **Supabase CDN**: 이미지 최적화 배송

### 2. 로딩 최적화
- **지연 로딩**: 이미지 리소스
- **모듈 분할**: JavaScript 번들 최적화

### 3. 모니터링
- **logs/ 디렉토리**: 에러 로그 수집
- **성능 메트릭**: 게임 플레이 데이터 분석

---

## 향후 개발 가이드

### 새 기능 추가 시
1. **계획**: TaskPlanner 모드로 요구사항 분석
2. **설계**: 기존 모듈 구조와 일관성 유지
3. **구현**: 모듈화 원칙 준수하여 개발
4. **검증**: 반응형 및 기능 테스트 완료

### 코드 품질 기준
- CSS: BEM 방법론 적용
- JavaScript: ES6+ 문법 활용
- 파일명: kebab-case 사용
- 주석: JSDoc 형식 권장

### 배포 및 운영
- **Vercel**: 정적 사이트 배포
- **Supabase**: 백엔드 서비스 운영
- **환경변수**: .env 파일로 관리

**다음 작업**: 게임 기능 상태 및 UI 구조 현황 기록 