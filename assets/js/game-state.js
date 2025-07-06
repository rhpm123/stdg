/**
 * 틀린그림찾기 게임 - 상태 관리 모듈
 * 게임의 전체적인 상태를 관리합니다.
 */

// 게임 상태 객체
let gameState = {
  isGameActive: false,
  isPaused: false,
  currentImageSet: null,
  answerPoints: [],
  foundPoints: [],
  score: 0,
  startTime: null,
  elapsedTime: 0,
  timerInterval: null,
  // 시간 제한 시스템
  timeLimit: 90000,        // 90초 (밀리초)
  timeWarningThreshold: 30000,  // 30초 남았을 때 경고
  timePenaltyInterval: 15000,   // 15초마다 체력 감소
  lastPenaltyTime: 0,      // 마지막 체력 감소 시간
  // DB 이미지 크기 정보
  dbImageWidth: null,
  dbImageHeight: null,
  // 디버그 모드
  debugMode: false,
  // 힌트 시스템
  hints: {
    used: 0,              // 현재 게임에서 사용한 힌트 수
    maxPerGame: 3,        // 게임당 최대 힌트 수
    dailyUsed: 0,         // 오늘 사용한 총 힌트 수
    maxDaily: 10,         // 일일 최대 힌트 수
    lastUsedTime: 0,      // 마지막 힌트 사용 시간 (timestamp)
    cooldownMs: 30000     // 쿨다운 시간 (30초)
  }
};

/**
 * URL 파라미터에서 이미지 세트 ID 가져오기
 */
function getImageSetId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || '1';
}

/**
 function resetGameState() {
   if (gameState.timerInterval) {
     clearInterval(gameState.timerInterval);
   }
   
   gameState.isGameActive = false;
   gameState.isPaused = false;
   gameState.foundPoints = [];
   gameState.score = 0;
   gameState.elapsedTime = 0;
   gameState.startTime = null;
   gameState.lastPenaltyTime = 0;
   gameState.timerInterval = null;
   
   // 게임별 힌트 카운터 초기화 (일일 카운터는 유지)
   gameState.hints.used = 0;
   gameState.hints.lastUsedTime = 0;
 }

/**
 * 게임 시작 상태로 설정
 */
function startGameState() {
  gameState.isGameActive = true;
  gameState.isPaused = false;
  gameState.startTime = Date.now();
  gameState.elapsedTime = 0;
  gameState.lastPenaltyTime = 0;
  gameState.foundPoints = [];
  gameState.score = 0;
}
/**
 * 게임 일시정지/재개 토글
 */
function togglePauseState() {
  if (!gameState.isGameActive) return false;
  
  gameState.isPaused = !gameState.isPaused;
  return gameState.isPaused;
}

/**
 * 점수 추가
 */
function addScore(points) {
  gameState.score += points;
}

/**
 * 발견된 영역 추가
 */
function addFoundPoint(regionIndex) {
  if (!gameState.foundPoints.includes(regionIndex)) {
    gameState.foundPoints.push(regionIndex);
    return true;
  }
  return false;
}

/**
 * 게임 완료 여부 확인
 */
function isGameComplete() {
  return gameState.foundPoints.length === gameState.answerPoints.length;
}

/**
 * 경과 시간 업데이트
 */
function updateElapsedTime() {
  if (gameState.isGameActive && !gameState.isPaused && gameState.startTime) {
    gameState.elapsedTime = Date.now() - gameState.startTime;
  }
}

/**
 * 게임 데이터 설정
 */
function setGameData(imageSet, answerData) {
  gameState.currentImageSet = imageSet;
  gameState.answerPoints = answerData.regions || [];
  gameState.dbImageWidth = answerData.image_width;
  gameState.dbImageHeight = answerData.image_height;
  
  // 기존 코드와의 호환성을 위해 currentImageSet에도 저장
  gameState.currentImageSet.image_width = answerData.image_width;
  gameState.currentImageSet.image_height = answerData.image_height;
}

/**
 * 오늘 날짜 문자열 반환 (YYYY-MM-DD 형식)
 */
function getTodayDateString() {
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
}

/**
 * localStorage에서 일일 힌트 사용량 로드
 */
function loadDailyHintData() {
  try {
    const today = getTodayDateString();
    const key = `hint_usage_${today}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      const hintData = JSON.parse(data);
      gameState.hints.dailyUsed = hintData.dailyUsed || 0;
      console.log('📊 일일 힌트 데이터 로드:', {
        날짜: today,
        사용량: gameState.hints.dailyUsed,
        최대: gameState.hints.maxDaily
      });
    } else {
      // 오늘 데이터가 없으면 0으로 초기화
      gameState.hints.dailyUsed = 0;
      console.log('🌅 새로운 날, 일일 힌트 카운터 초기화');
    }
  } catch (error) {
    console.error('🚨 일일 힌트 데이터 로드 오류:', error);
    gameState.hints.dailyUsed = 0;
  }
}

/**
 * localStorage에 일일 힌트 사용량 저장
 */
function saveDailyHintData() {
  try {
    const today = getTodayDateString();
    const key = `hint_usage_${today}`;
    const data = {
      dailyUsed: gameState.hints.dailyUsed,
      lastSaved: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log('💾 일일 힌트 데이터 저장:', {
      날짜: today,
      사용량: gameState.hints.dailyUsed
    });
  } catch (error) {
    console.error('🚨 일일 힌트 데이터 저장 오류:', error);
  }
}

/**
 * 힌트 사용 후 데이터 업데이트
 */
function incrementHintUsage() {
  gameState.hints.used++;
  gameState.hints.dailyUsed++;
  gameState.hints.lastUsedTime = Date.now();
  
  // localStorage에 일일 사용량 저장
  saveDailyHintData();
  
  console.log('💡 힌트 사용량 업데이트:', {
    게임내: `${gameState.hints.used}/${gameState.hints.maxPerGame}`,
    일일: `${gameState.hints.dailyUsed}/${gameState.hints.maxDaily}`
  });
}
// 전역 접근을 위한 export (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    gameState,
    getImageSetId,
    resetGameState,
    startGameState,
    togglePauseState,
    addScore,
    addFoundPoint,
    isGameComplete,
    updateElapsedTime,
    setGameData,
    // 힌트 관련 함수들
    loadDailyHintData,
    saveDailyHintData,
    incrementHintUsage,
    getTodayDateString
  };
} 