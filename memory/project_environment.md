# 프로젝트 환경 및 상태 정보

## 프로젝트 기본 정보

### 경로 및 서버 정보
- **프로젝트 루트**: `C:\MYCLAUDE_PROJECT\myp`
- **서버 주소**: `http://localhost:3000`
- **메인 서버 파일**: `server.js` (795라인)
- **패키지명**: `spot-the-difference-app` v1.0.0
- **설명**: 틀린그림찾기 앱

### 서버 구성
```javascript
// 기본 설정
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### 실행 스크립트
- **시작**: `npm start` → `node server.js`
- **개발**: `npm run dev` → `node server.js`
- **테스트**: `npm test` → `node test-deployment.js`
- **API 테스트**: `npm run test:api`
- **보안 테스트**: `npm run test:security`
- **배포**: `npm run deploy` → `vercel --prod`

---

## 환경 설정 현황

### 데이터베이스 연동 (Supabase)
```javascript
// 환경변수 기반 Supabase 클라이언트
const supabaseUrl = process.env.SUPABASE_URL || 'MISSING_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);
```

**필수 환경변수:**
- `SUPABASE_URL`: Supabase 프로젝트 API URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role 키
- `PORT`: 서버 포트 (기본값: 3000)

**보안 검증**: .env 파일 누락 시 서버 시작 차단 (`process.exit(1)`)

### 로그 시스템
- **로그 디렉토리**: `logs/` (현재 비어있음)
- **에러 로깅**: 이곳에 실행 오류가 쌓이도록 설계

### 의존성 라이브러리
#### 핵심 의존성
- **Express**: `^5.1.0` (웹 서버)
- **Supabase**: `^2.49.8` (데이터베이스)
- **dotenv**: `^16.5.0` (환경변수)
- **cors**: `^2.8.5` (CORS 처리)

#### MCP 도구
- **@supabase/mcp-server-supabase**: `^0.4.1`
- **@modelcontextprotocol/server-postgres**: `^0.6.2`
- **supabase-mcp**: `^1.5.0`

#### 추가 도구
- **axios**: `^1.9.0` (HTTP 클라이언트)
- **canvas**: `^3.1.0` (이미지 처리)
- **formidable**: `^3.5.4` (파일 업로드)
- **pg**: `^8.16.0` (PostgreSQL 드라이버)

---

## Git 저장소 상태

### 브랜치 정보
- **현재 브랜치**: `master`
- **origin 대비 상태**: **59 커밋 앞섬** ⚠️
- **상태**: 로컬 변경사항 다수 존재

### 변경된 파일 (Unstaged)
```
modified:   WebGUI.md
deleted:    api/index.js
modified:   assets/js/bottom-bar-manager.js
modified:   assets/js/cache-buster.js  
modified:   assets/js/game-state.js
modified:   assets/js/orientation-controller.js
modified:   supabase-mcp (untracked content)
modified:   tasks.json
modified:   test-healthbar.html
```

### 추적되지 않는 파일
- **메모리 백업들**: `memory/tasks_memory_*.json` (17개)
- **새 문서**: `memory/ui_optimization_summary.md`

### Git 상태 권장사항
⚠️ **주의**: origin보다 59 커밋 앞서있어 `git push` 필요
⚠️ **권장**: 변경사항 커밋 후 원격 저장소 동기화

---

## 디렉토리 구조

### 주요 디렉토리
```
myp/
├── assets/           # 정적 자원 (CSS, JS)
│   ├── css/game/    # 게임 UI CSS 모듈
│   └── js/          # JavaScript 모듈들
├── api/             # API 엔드포인트
├── config/          # 설정 파일들
├── db/              # 데이터베이스 관련
├── logs/            # 로그 저장소 (현재 비어있음)
├── memory/          # Shrimp Task 메모리
├── public/          # 공개 정적 파일
├── src/             # 소스 코드
├── supabase/        # Supabase 함수들
└── SHRIMP/          # Task Manager 설정
```

### 핵심 HTML 파일
- `index.html`: 메인 페이지
- `game-home.html`: 게임 홈
- `game-play.html`: 게임 플레이 (UI 최적화 완료)
- `game-result.html`: 게임 결과
- `login.html`: 로그인
- `compare-images.html`: 이미지 비교

---

## 환경 상태 요약

### ✅ 정상 작동 상태
- Express 서버 구성 완료
- Supabase 연동 준비 완료 
- MCP 도구 통합 완료
- 모듈화된 CSS/JS 구조

### ⚠️ 주의사항
- .env 파일 부재 (환경변수 설정 필요)
- Git 상태 불일치 (59 커밋 앞섰)
- logs/ 디렉토리 비어있음

### 🔧 설정 필요사항
1. .env 파일 생성 및 Supabase 연결 정보 설정
2. Git 커밋 및 푸시로 원격 저장소 동기화
3. 로그 시스템 활성화 확인

**다음 작업**: 기술 스택 및 개발 도구 현황 정리 