/**
 * 틀린그림찾기 게임 - 메인 게임 로직
 * 게임의 핵심 동작을 담당합니다.
 */

// 전역 변수
let debugMode = false;
let showAnswers = false;

/**
 * 게임 데이터 로딩
 */
async function loadGameData() {
  try {
    showLoading(true);
    console.log('🔄 게임 데이터 로딩 시작...');
    
    const imageSetId = getImageSetId();
    console.log('📋 이미지 세트 ID:', imageSetId);
    
    // 이미지 세트 정보 가져오기
    const imageSets = await fetchImageSets();
    const currentSet = imageSets.find(set => set.id.toString() === imageSetId);
    
    if (!currentSet) {
      throw new Error(`이미지 세트 ID ${imageSetId}를 찾을 수 없습니다.`);
    }
    
    // 정답 데이터 가져오기
    const answerData = await fetchAnswerPoints(imageSetId);
    console.log('📊 정답 데이터 로딩 완료:', {
      regions: answerData.regions.length,
      imageSize: `${answerData.image_width}x${answerData.image_height}`,
      samplePoint: answerData.regions[0] ? `(${answerData.regions[0][0].x}, ${answerData.regions[0][0].y})` : 'N/A'
    });
    
    // 게임 상태에 데이터 설정
    setGameData(currentSet, answerData);
    
    // 이미지 표시
    displayImages(currentSet);
    
    showLoading(false);
    showMessage('게임 데이터 로딩 완료!', 'success');
    
  } catch (error) {
    console.error('❌ 게임 데이터 로딩 실패:', error);
    showLoading(false);
    showMessage(`데이터 로딩 실패: ${error.message}`, 'error');
  }
}

/**
 * 이미지 표시
 */
function displayImages(imageSet) {
  const originalImg = document.getElementById('originalImage');
  const modifiedImg = document.getElementById('modifiedImage');
  const container = document.getElementById('imagesContainer');
  
  if (!originalImg || !modifiedImg || !container) {
    throw new Error('이미지 요소를 찾을 수 없습니다.');
  }
  
  originalImg.src = imageSet.original_image_url;
  modifiedImg.src = imageSet.modified_image_url;
  
  // 이미지 로딩 완료 대기
  Promise.all([
    new Promise(resolve => {
      originalImg.onload = resolve;
      originalImg.onerror = () => resolve();
    }),
    new Promise(resolve => {
      modifiedImg.onload = resolve;
      modifiedImg.onerror = () => resolve();
    })
  ]).then(() => {
    container.style.display = 'block';
    console.log('🖼️ 이미지 표시 완료');
    updateUI();
  });
}

/**
 * 게임 시작
 */
function startGame() {
  console.log('🚀 [DEBUG] startGame 함수 호출됨!');
  if (!gameState.currentImageSet || !gameState.answerPoints.length) {
    showMessage('게임 데이터를 먼저 로딩해주세요.', 'error');
    return;
  }
    
  startGameState();
  startTimer();
  
  // 힌트 시스템 초기화
  if (typeof resetHintSystem === 'function') {
    resetHintSystem();
  }
  
  // 체력바 시스템 초기화 및 시작
  console.log('🔧 체력바 시스템 초기화 시작...');
  if (typeof window.healthBarSystem !== 'undefined') {
    console.log('✅ healthBarSystem 발견! 초기화 및 시작 중...');
    
    // 먼저 초기화
    const initResult = window.healthBarSystem.init();
    console.log('🔧 체력바 초기화 결과:', initResult);
    
    // 초기화 성공 시 시작
    if (initResult) {
      window.healthBarSystem.start();
      console.log('✅ 체력바 시스템 시작 완료');
    } else {
      console.error('❌ 체력바 시스템 초기화 실패');
    }
  } else {
    console.error('❌ healthBarSystem을 찾을 수 없습니다!');
    console.log('🔍 window 객체에서 health 관련 속성 검색:', 
      Object.keys(window).filter(key => key.toLowerCase().includes('health')));
  }
  
  updateUI();
  
  showMessage('게임이 시작되었습니다!', 'success');
  console.log('🎮 게임 시작!');
}
/**
 * 게임 일시정지/재개
 */
function pauseGame() {
  const isPaused = togglePauseState();
  
  if (isPaused) {
    clearInterval(gameState.timerInterval);
    showMessage('게임이 일시정지되었습니다.', 'success');
  } else {
    startTimer();
    showMessage('게임이 재개되었습니다.', 'success');
  }
  
  // 시간 제한 시각화 시스템은 gameState.isPaused 상태를 자동으로 확인하므로 별도 처리 불필요
  
  updateUI();
}

/**
 /**
  * 게임 리셋
  */
 function resetGame() {
   console.log('🔄 [DEBUG] resetGame 함수 호출됨!');
   console.trace('[DEBUG] resetGame 호출 스택 트레이스:');
   resetGameState();
   removeAnswerPoints();
   
   // 힌트 시스템 초기화
   if (typeof resetHintSystem === 'function') {
     resetHintSystem();
   }
   
   // 체력바 시스템 리셋 및 재초기화
   if (typeof window.healthBarSystem !== 'undefined') {
     window.healthBarSystem.reset();
     // 리셋 후 재초기화
     window.healthBarSystem.init();
     console.log('✅ 체력바 시스템 리셋 및 재초기화 완료');
   }
   
   updateUI();
   showMessage('게임이 리셋되었습니다.', 'success');
   console.log('🔄 게임 리셋');
 }
/**
 * 타이머 시작
 */
function startTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }
  
  gameState.timerInterval = setInterval(() => {
    if (gameState.isGameActive && !gameState.isPaused) {
      updateElapsedTime();
      updateTimerDisplay();
    }
  }, 1000);
}

/**
 * 타이머 표시 업데이트
 */
function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    const remainingTime = Math.max(0, gameState.timeLimit - gameState.elapsedTime);
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    
    // 시간이 30초 이하로 남았을 때 경고 색상
    if (remainingTime <= gameState.timeWarningThreshold) {
      timerEl.style.color = '#e74c3c';
      timerEl.style.fontWeight = 'bold';
    } else {
      timerEl.style.color = '';
      timerEl.style.fontWeight = '';
    }
    
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 시간 제한 및 체력 감소 처리
    checkTimeLimit();
  }
}

/**
 * 시간 제한 처리
 */
function checkTimeLimit() {
  if (!gameState.isGameActive || gameState.isPaused) return;
  
  const currentTime = gameState.elapsedTime;
  const remainingTime = gameState.timeLimit - currentTime;
  
  // 시간 제한 초과 시 게임 종료
  if (remainingTime <= 0) {
    handleTimeUp();
    return;
  }
  
  // 체력바 시스템이 자동으로 시간에 따른 체력 감소를 처리합니다.
}

/**
 * 시간 초과로 인한 체력 감소 (체력바 시스템으로 대체됨)
 * 이제 체력바 시스템이 자동으로 시간에 따른 체력 감소를 처리합니다.
 */
function applyTimePenalty() {
  // 체력바 시스템이 자동으로 처리하므로 이 함수는 더 이상 사용되지 않습니다.
  // 기존 15초마다 하트 감소 로직은 체력바 시스템의 구간별 하트 감소로 대체되었습니다.
}

/**
 * 시간 종료 처리
 */
function handleTimeUp() {
  gameState.isGameActive = false;
  clearInterval(gameState.timerInterval);
  
  // 시간 제한 시각화 시스템 정지
  if (typeof window.healthBarSystem !== 'undefined') {
    window.healthBarSystem.stop();
  }
  
  showMessage('⏰ 시간 종료! 게임이 끝났습니다.', 'error');
  console.log('⏰ 시간 제한 도달 - 게임 종료');
  
  // 게임 결과 화면으로 이동
  setTimeout(() => {
    showGameOverModal('시간 종료');
  }, 1500);
}

/**
 * 게임 오버 처리 (체력 소진)
 */
function handleGameOver() {
  gameState.isGameActive = false;
  clearInterval(gameState.timerInterval);
  
  // 시간 제한 시각화 시스템 정지
  if (typeof window.healthBarSystem !== 'undefined') {
    window.healthBarSystem.stop();
  }
  
  showMessage('💔 체력이 모두 소진되었습니다!', 'error');
  console.log('💔 체력 소진 - 게임 오버');
  
  // 게임 오버 모달 표시
  setTimeout(() => {
    showGameOverModal('체력 소진');
  }, 1500);
}

/**
 * 게임 오버 모달 표시
 */
function showGameOverModal(reason) {
  const existingModal = document.querySelector('.game-over-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 모달 생성
  const modal = document.createElement('div');
  modal.className = 'game-over-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>😭 게임 오버!</h2>
      </div>
      
      <div class="modal-body">
        <div class="game-over-reason">
          <p><strong>종료 사유:</strong> ${reason}</p>
        </div>
        
        <div class="score-summary">
          <div class="score-item">
            <span class="label">최종 점수:</span>
            <span class="value">${gameState.score}점</span>
          </div>
          
          <div class="score-item">
            <span class="label">소요 시간:</span>
            <span class="value">${Math.floor(gameState.elapsedTime / 60000)}분 ${Math.floor((gameState.elapsedTime % 60000) / 1000)}초</span>
          </div>
          
          <div class="score-item">
            <span class="label">찾은 정답:</span>
            <span class="value">${gameState.foundPoints.length}/${gameState.answerPoints.length}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-primary" onclick="location.href='../index.html'">🏠 메인메뉴</button>
        <button class="btn-secondary" onclick="location.reload()">🔄 다시 하기</button>
      </div>
    </div>
    <div class="modal-backdrop" onclick="closeGameOverModal()"></div>
  `;
  
  document.body.appendChild(modal);
  
  // 모달 애니메이션
  setTimeout(() => {
    modal.classList.add('show');
  }, 100);
  
  console.log('📺 게임 오버 모달 표시!');
}

/**
 * 게임 오버 모달 닫기
 */
function closeGameOverModal() {
  const modal = document.querySelector('.game-over-modal');
  if (modal) {
    // 즉시 블러 효과 제거
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.style.backdropFilter = 'none';
      backdrop.style.webkitBackdropFilter = 'none'; // Safari 지원
    }
    
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}
/**
 * UI 업데이트
 */
function updateUI() {
  // 점수 업데이트
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = gameState.score;
  
  // 진행률 업데이트
  const progressEl = document.getElementById('progress');
  const progressBarEl = document.getElementById('progressBar');
  const foundEl = document.getElementById('found');
  
  if (progressEl && progressBarEl && foundEl) {
    const progress = gameState.answerPoints.length > 0 
      ? Math.round((gameState.foundPoints.length / gameState.answerPoints.length) * 100) 
      : 0;
    
    progressEl.textContent = `${progress}%`;
    progressBarEl.style.width = `${progress}%`;
    foundEl.textContent = `${gameState.foundPoints.length}/${gameState.answerPoints.length}`;
  }
  
  // 버튼 상태 업데이트
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const hintBtn = document.getElementById('hintBtn');
  
  if (startBtn && pauseBtn) {
    if (gameState.isGameActive) {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      pauseBtn.textContent = gameState.isPaused ? '재개' : '일시정지';
      
      // 게임 진행 중일 때 힌트 버튼 활성화
      if (hintBtn) {
        hintBtn.disabled = false;
      }
    } else {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      pauseBtn.textContent = '일시정지';
      
      // 게임 비활성 시 힌트 버튼 비활성화
      if (hintBtn) {
        hintBtn.disabled = true;
      }
    }
  }
}
/**
 * 게임 상태 확인 (모든 정답을 찾았는지)
 */
function checkGameCompletion() {
  if (!gameState.answerPoints) return false;
  
  const totalAnswers = gameState.answerPoints.length;
  const foundAnswers = gameState.foundPoints.length;
  
  console.log('🎯 게임 진행률:', {
    찾은답: foundAnswers,
    전체답: totalAnswers,
    완성여부: foundAnswers === totalAnswers
  });
  
  if (foundAnswers === totalAnswers) {
    console.log('🎉 모든 정답을 찾았습니다!');
    
    // 축하 애니메이션 실행
    setTimeout(() => {
      celebrateAllAnswers();
    }, 500);
    
    return true;
  }
  
  return false;
}

// 전역 접근을 위한 export (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadGameData,
    displayImages,
    startGame,
    pauseGame,
    resetGame,
    startTimer,
    updateTimerDisplay,
    updateUI,
    debugMode,
    showAnswers
  };
}

/**
 * 시간 보너스 계산
 * @param {number} elapsedTime - 경과 시간 (밀리초)
 * @returns {number} 시간 보너스 점수
 */
function calculateTimeBonus(elapsedTime) {
  const minutes = elapsedTime / 60000; // 분 단위로 변환
  
  // 3분 이내: 200점 보너스
  // 5분 이내: 100점 보너스  
  // 10분 이내: 50점 보너스
  // 10분 초과: 보너스 없음
  
  if (minutes <= 3) {
    return 200;
  } else if (minutes <= 5) {
    return 100;
  } else if (minutes <= 10) {
    return 50;
  } else {
    return 0;
  }
}

/**
 * 게임 결과 저장
 * @param {Object} result - 게임 결과 데이터
 */
async function saveGameResult(result) {
  try {
    console.log('💾 게임 결과 저장 시도:', result);
    
    // API 호출로 Supabase에 결과 저장
    const response = await fetch('/api/save-game-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageSetId: result.imageSetId,
        score: result.score,
        elapsedTime: result.elapsedTime,
        foundCount: result.foundCount,
        totalCount: result.totalCount,
        completedAt: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log('✅ 게임 결과 저장 성공');
    } else {
      console.warn('⚠️ 게임 결과 저장 실패:', response.statusText);
    }
    
  } catch (error) {
    console.error('❌ 게임 결과 저장 오류:', error);
    // 오류가 발생해도 게임은 계속 진행
  }
}

/**
 * 게임 완료 모달 표시
 * @param {number} finalScore - 최종 점수
 * @param {string} timeString - 소요 시간 문자열
 * @param {number} timeBonus - 시간 보너스
 */
function showGameCompleteModal(finalScore, timeString, timeBonus) {
  const existingModal = document.querySelector('.game-complete-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 모달 생성
  const modal = document.createElement('div');
  modal.className = 'game-complete-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>🏆 게임 완료!</h2>
      </div>
      
      <div class="modal-body">
        <div class="score-summary">
          <div class="score-item">
            <span class="label">최종 점수:</span>
            <span class="value final-score">${finalScore}점</span>
          </div>
          
          <div class="score-item">
            <span class="label">소요 시간:</span>
            <span class="value">${timeString}</span>
          </div>
          
          ${timeBonus > 0 ? `
          <div class="score-item bonus">
            <span class="label">시간 보너스:</span>
            <span class="value">+${timeBonus}점</span>
          </div>
          ` : ''}
          
          <div class="score-item">
            <span class="label">정답률:</span>
            <span class="value">${Math.round((gameState.foundPoints.length / gameState.answerPoints.length) * 100)}%</span>
          </div>
        </div>
        
        <div class="achievement-text">
          ${getAchievementMessage(finalScore, timeBonus)}
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-primary" onclick="location.href='../index.html'">🏠 메인메뉴</button>
        <button class="btn-secondary" onclick="location.reload()">🔄 다시 하기</button>
        <button class="btn-success" onclick="playNextGame()">➡️ 다음 게임</button>
      </div>
    </div>
    <div class="modal-backdrop" onclick="closeGameCompleteModal()"></div>
  `;
  
  document.body.appendChild(modal);
  
  // 모달 애니메이션
  setTimeout(() => {
    modal.classList.add('show');
  }, 100);
  
  console.log('🎆 게임 완료 모달 표시!');
}

/**
 * 성취 메시지 생성
 */
function getAchievementMessage(finalScore, timeBonus) {
  if (timeBonus >= 200) {
    return '🎆 환상적입니다! 속도의 마스터!';
  } else if (timeBonus >= 100) {
    return '🚀 종음! 빠른 반응속도를 보여주셨네요!';
  } else if (timeBonus >= 50) {
    return '👍 좋아요! 꿀한 속도로 완성하셨네요!';
  } else if (finalScore >= gameState.answerPoints.length * 100) {
    return '🎯 완벽! 모든 정답을 찾으셨네요!';
  } else {
    return '🎉 수고하셨습니다! 다음에는 더 빠르게 도전해보세요!';
  }
}

/**
 * 모달 닫기
 */
function closeGameCompleteModal() {
  const modal = document.querySelector('.game-complete-modal');
  if (modal) {
    // 즉시 블러 효과 제거
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.style.backdropFilter = 'none';
      backdrop.style.webkitBackdropFilter = 'none'; // Safari 지원
    }
    
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

/**
 * 다음 게임 시작
 */
function playNextGame() {
  // 다음 이미지 세트 ID 찾기
  const currentId = parseInt(getImageSetId());
  const nextId = currentId + 1;
  
  // 다음 게임으로 이동
  window.location.href = `game-play.html?id=${nextId}`;
}