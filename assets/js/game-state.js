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
  // DB 이미지 크기 정보
  dbImageWidth: null,
  dbImageHeight: null,
  // 디버그 모드
  debugMode: false
};

/**
 * URL 파라미터에서 이미지 세트 ID 가져오기
 */
function getImageSetId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || '1';
}

/**
 * 게임 상태 초기화
 */
function resetGameState() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }
  
  gameState.isGameActive = false;
  gameState.isPaused = false;
  gameState.foundPoints = [];
  gameState.score = 0;
  gameState.elapsedTime = 0;
  gameState.timerInterval = null;
}

/**
 * 게임 시작 상태로 설정
 */
function startGameState() {
  gameState.isGameActive = true;
  gameState.isPaused = false;
  gameState.startTime = Date.now();
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
    setGameData
  };
} 