/**
 * 틀린그림찾기 게임 - 클릭 처리 모듈
 * 이미지 클릭 및 정답 체크를 담당합니다.
 */

/**
 * 이미지 클릭 처리
 */
function handleImageClick(event) {
  if (!gameState.isGameActive || gameState.isPaused) {
    console.log('⚠️ 게임이 활성화되지 않음 또는 일시정지 상태');
    return;
  }
  
  if (!gameState.answerPoints || gameState.answerPoints.length === 0) {
    console.log('⚠️ 정답 데이터가 없습니다.');
    return;
  }
  
  try {
    // 좌표 변환
    const containerInfo = getImageContainerInfo('modifiedContainer', 'modifiedImage');
    const screenCoords = eventToImageCoordinates(event, containerInfo);
    
    if (!screenCoords.isWithinImage) {
      console.log('⚠️ 이미지 외부 클릭');
      return;
    }
    
    const dbCoords = screenToDbCoordinates(
      screenCoords.x, 
      screenCoords.y, 
      containerInfo, 
      gameState.dbImageWidth || 816, 
      gameState.dbImageHeight || 1224
    );
    
    // 디버그 정보 로깅
    if (debugMode) {
      logCoordinateDebugInfo(screenCoords, dbCoords, containerInfo, gameState.dbImageWidth || 816, gameState.dbImageHeight || 1224);
    }
    
    console.log('🎯 클릭 감지:', {
      이미지좌표: `(${Math.round(screenCoords.x)}, ${Math.round(screenCoords.y)})`,
      DB좌표: `(${Math.round(dbCoords.x)}, ${Math.round(dbCoords.y)})`
    });
    
    // 정답 체크
    const result = checkAnswer(dbCoords.x, dbCoords.y, 15);
    
    if (result.found) {
      handleCorrectAnswer(result, screenCoords, containerInfo);
    } else {
      handleWrongAnswer(screenCoords, containerInfo);
    }
    
  } catch (error) {
    console.error('❌ 클릭 처리 중 오류:', error);
    showMessage('클릭 처리 중 오류가 발생했습니다.', 'error');
  }
}

/**
 * 정답 체크
 */
function checkAnswer(dbX, dbY, tolerance = 15) {
  for (let regionIndex = 0; regionIndex < gameState.answerPoints.length; regionIndex++) {
    // 이미 발견된 영역은 건너뛰기
    if (gameState.foundPoints.includes(regionIndex)) {
      continue;
    }
    
    const region = gameState.answerPoints[regionIndex];
    
    // 영역 내의 모든 점과 거리 체크
    for (let point of region) {
      const distance = calculateDistance(dbX, dbY, point.x, point.y);
      
      if (distance <= tolerance) {
        console.log('✅ 정답 발견!', {
          영역번호: regionIndex,
          클릭위치: `(${Math.round(dbX)}, ${Math.round(dbY)})`,
          정답점: `(${point.x}, ${point.y})`,
          거리: Math.round(distance),
          허용오차: tolerance,
          '정확도%': Math.round((1 - distance/tolerance) * 100)
        });
        
        return {
          found: true,
          regionIndex: regionIndex,
          clickedPoint: point,
          distance: distance
        };
      }
    }
  }
  
  console.log('❌ 정답 아님:', {
    클릭위치: `(${Math.round(dbX)}, ${Math.round(dbY)})`,
    허용오차: tolerance,
    '힌트': '더 정확한 위치를 클릭해보세요'
  });
  
  return { found: false };
}

/**
 * 정답 처리
 */
function handleCorrectAnswer(result, screenCoords, containerInfo) {
  const regionIndex = result.regionIndex;
  
  // 점수 추가
  addScore(100);
  
  // 발견된 영역 추가
  addFoundPoint(regionIndex);
  
  // 마커 대신 파티클 효과 생성
  createParticleEffect(screenCoords, containerInfo);
  
  // 클릭한 정답 영역 깜빡임 효과 (3초간, 더 빠른 피드백)
  setTimeout(() => {
    showDifferenceBlinking(regionIndex, 3000);
  }, 100); // 파티클 효과와 함께 깜빡임
  
  // 각 영역별로 독립적인 체크마킹 타이머 (깜빡임 완료 후 생성)
  setTimeout(() => {
    // 해당 영역의 깜빡임이 여전히 존재하는지 확인 후 체크마킹 생성
    const targetOverlay = document.querySelector(`.difference-blink-overlay[data-region="${regionIndex}"]`);
    if (targetOverlay || true) { // 깜빡임이 끝났어도 체크마킹은 생성
      createCorrectAreaMarker(screenCoords, containerInfo, regionIndex);
      console.log(`✅ 영역 ${regionIndex} 체크마킹 독립적 생성 (3초 후)`);
    }
  }, 3200); // 깜빡임 완료 직후 (3초 + 200ms 여유, 파티클 시간 고려)
  
  // UI 업데이트
  updateUI();
  
  showMessage(`정답! +100점 (${gameState.foundPoints.length}/${gameState.answerPoints.length})`, 'success');
  
  // 게임 완료 체크
  if (isGameComplete()) {
    handleGameComplete();
  }
}

/**
 * 파티클 터지는 효과 생성 (7개 버전!)
 */
function createParticleEffect(screenCoords, containerInfo) {
  const container = containerInfo.container;
  
  // 7개의 파티클을 시간차를 두고 생성 (6개 → 7개로 증가)
  for (let i = 1; i <= 7; i++) {
    // 파티클 생성 자체를 시간차로 (0~0.6초 사이)
    const creationDelay = Math.random() * 0.6 * 1000; // 밀리초로 변환
    
    setTimeout(() => {
      // 파티클 시작 위치 랜덤화 (클릭 지점 주변 반경 15px)
      const offsetX = (Math.random() - 0.5) * 30; // -15px ~ +15px
      const offsetY = (Math.random() - 0.5) * 30; // -15px ~ +15px
      
      // 각 파티클마다 개별 컨테이너 생성
      const particleContainer = document.createElement('div');
      particleContainer.className = 'particle-container';
      particleContainer.style.left = (containerInfo.imgStartX + screenCoords.x + offsetX) + 'px';
      particleContainer.style.top = (containerInfo.imgStartY + screenCoords.y + offsetY) + 'px';
      
      const particle = document.createElement('div');
      particle.className = `particle particle-${((i - 1) % 8) + 1}`; // 1~7번 애니메이션 사용 (8개 중 7개)
      
      // 파티클 크기 랜덤화 및 증가
      const size = Math.random() * 8 + 12; // 12~20px 
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // 파티클 색상 7가지로 확장 - 더 진하고 선명하게
      const colors = [
        '#e74c3c', // 진한 빨강 (기존: #ff6b6b)
        '#16a085', // 진한 청록 (기존: #4ecdc4)  
        '#f39c12', // 진한 노랑 (기존: #f9ca24)
        '#8e44ad', // 진한 보라 (기존: #6c5ce7)
        '#2980b9', // 진한 파랑 (기존: #45b7d1)
        '#e91e63', // 진한 핑크 (기존: #fd79a8)
        '#27ae60'  // 진한 초록 (기존: #00b894)
      ];
      particle.style.backgroundColor = colors[i - 1];
      
      // animationDelay 제거 - 생성되자마자 바로 터짐!
      // particle.style.animationDelay = '0s'; // 기본값이므로 생략
      
      particleContainer.appendChild(particle);
      container.appendChild(particleContainer);
      
      // 각 파티클 개별적으로 제거 (1.2초 후 - 애니메이션 완료 후)
      setTimeout(() => {
        if (particleContainer.parentNode) {
          particleContainer.parentNode.removeChild(particleContainer);
        }
      }, 1200); // 1.0초 애니메이션 + 0.2초 여유
      
    }, creationDelay); // 파티클 생성 시간차
  }
  
  console.log('🎉💥 멋진 7발 연쇄폭발!', {
    위치: `(${Math.round(screenCoords.x)}, ${Math.round(screenCoords.y)})`,
    파티클수: 7,
    분산반경: '30px (±15px)',
    생성시간차: '0~0.6초',
    즉시폭발: 'true',
    효과: '딱 좋은 7발 폭발!'
  });
}

/**
 * 정답 영역 체크 마킹 생성 (깜빡임 완료 후)
 */
function createCorrectAreaMarker(screenCoords, containerInfo, regionIndex) {
  const container = containerInfo.container;
  
  // 체크 마킹 컨테이너 생성
  const checkMarker = document.createElement('div');
  checkMarker.className = 'correct-area-marker';
  checkMarker.style.position = 'absolute';
  checkMarker.style.left = (containerInfo.imgStartX + screenCoords.x - 15) + 'px';
  checkMarker.style.top = (containerInfo.imgStartY + screenCoords.y - 15) + 'px';
  checkMarker.style.width = '30px';
  checkMarker.style.height = '30px';
  checkMarker.style.borderRadius = '50%';
  checkMarker.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
  checkMarker.style.border = '3px solid #fff';
  checkMarker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  checkMarker.style.pointerEvents = 'none';
  checkMarker.style.zIndex = '1001';
  checkMarker.style.display = 'flex';
  checkMarker.style.alignItems = 'center';
  checkMarker.style.justifyContent = 'center';
  checkMarker.style.fontSize = '16px';
  checkMarker.style.color = 'white';
  checkMarker.style.fontWeight = 'bold';
  
  // 체크 표시 추가
  checkMarker.textContent = '✓';
  
  // 데이터 속성 추가
  checkMarker.setAttribute('data-region', regionIndex);
  
  container.appendChild(checkMarker);
  
  // 등장 애니메이션
  checkMarker.style.transform = 'scale(0)';
  checkMarker.style.opacity = '0';
  
  setTimeout(() => {
    checkMarker.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    checkMarker.style.transform = 'scale(1)';
    checkMarker.style.opacity = '1';
  }, 50);
  
  console.log('✅ 정답 영역 체크 마킹 생성:', {
    영역번호: regionIndex,
    위치: `(${Math.round(screenCoords.x)}, ${Math.round(screenCoords.y)})`,
    마킹타입: '체크표시'
  });
  
  return checkMarker;
}

/**
 * 오답 처리
 */
function handleWrongAnswer(screenCoords, containerInfo) {
  // 하트 차감 (중요!)
  if (window.heartSystem && window.heartSystem.useHeart) {
    const heartUsed = window.heartSystem.useHeart();
    if (!heartUsed) {
      // 하트가 없으면 게임 오버
      handleGameOver();
      return;
    }
  }
  
  // 점수 차감
  addScore(-10);
  
  // UI 업데이트
  updateUI();
  
  showMessage('틀렸습니다. -10점 (하트 -1)', 'error');
  
  // 하트 깨지기 효과 생성
  createHeartBreakEffect(screenCoords, containerInfo);
}

/**
 * 게임 오버 처리 (하트 소진 시)
 */
function handleGameOver() {
  gameState.isGameActive = false;
  clearInterval(gameState.timerInterval);
  
  console.log('💀 게임 오버! 하트 소진');
  
  showMessage('게임 오버! 하트가 모두 소진되었습니다.', 'error');
  
  // 3초 후 결과 페이지로 이동 또는 재시작 옵션 제공
  setTimeout(() => {
    if (confirm('게임 오버! 다시 시작하시겠습니까?')) {
      location.reload(); // 페이지 새로고침으로 게임 재시작
    } else {
      window.location.href = 'game-result.html'; // 결과 페이지로 이동
    }
  }, 2000);
  
  updateUI();
}

/**
 * 게임 완료 처리
 */
function handleGameComplete() {
  gameState.isGameActive = false;
  clearInterval(gameState.timerInterval);
  
  const minutes = Math.floor(gameState.elapsedTime / 60000);
  const seconds = Math.floor((gameState.elapsedTime % 60000) / 1000);
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // 점수 계산 개선 (시간 보너스 포함)
  const timeBonus = calculateTimeBonus(gameState.elapsedTime);
  const finalScore = gameState.score + timeBonus;
  
  console.log('🏆 게임 완료!', {
    기본점수: gameState.score,
    시간보너스: timeBonus,
    최종점수: finalScore,
    소요시간: timeString
  });
  
  // 축하 애니메이션 실행
  setTimeout(() => {
    celebrateAllAnswers();
  }, 500);
  
  // 게임 결과 저장
  saveGameResult({
    imageSetId: gameState.currentImageSet.id,
    score: finalScore,
    elapsedTime: gameState.elapsedTime,
    foundCount: gameState.foundPoints.length,
    totalCount: gameState.answerPoints.length
  });
  
  // 결과 표시 및 다음 단계 안내
  setTimeout(() => {
    showGameCompleteModal(finalScore, timeString, timeBonus);
  }, 2000); // 축하 애니메이션 후 결과 모달 표시
  
  updateUI();
  }


/**
 * 정답 마커 생성
 */
function createAnswerMarker(screenCoords, containerInfo, type = 'found') {
  const container = containerInfo.container;
  
  const marker = document.createElement('div');
  marker.className = `answer-marker ${type}`;
  marker.style.position = 'absolute';
  marker.style.left = (containerInfo.imgStartX + screenCoords.x - 10) + 'px';
  marker.style.top = (containerInfo.imgStartY + screenCoords.y - 10) + 'px';
  marker.style.width = '20px';
  marker.style.height = '20px';
  marker.style.borderRadius = '50%';
  marker.style.border = '3px solid';
  marker.style.pointerEvents = 'none';
  marker.style.zIndex = '1000';
  
  if (type === 'correct') {
    marker.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
    marker.style.borderColor = '#00ff00';
    
    // 정답 발견 시 깜빡임 효과 추가
    marker.classList.add('blink');
    
    // 1.5초 후 깜빡임 효과 제거
    setTimeout(() => {
      marker.classList.remove('blink');
    }, 1500);
    
  } else if (type === 'answer') {
    marker.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
    marker.style.borderColor = '#ffff00';
  }
  
  container.appendChild(marker);
  
  // 애니메이션 효과
  marker.style.transform = 'scale(0)';
  setTimeout(() => {
    marker.style.transition = 'transform 0.3s ease-out';
    marker.style.transform = 'scale(1)';
  }, 10);
  
  return marker;
}

/**
 * 디버그 클릭 처리
 */
function debugClickHandler(event) {
  if (!debugMode) return;
  
  try {
    const containerInfo = getImageContainerInfo('modifiedContainer', 'modifiedImage');
    const screenCoords = eventToImageCoordinates(event, containerInfo);
    
    if (!screenCoords.isWithinImage) return;
    
    const dbCoords = screenToDbCoordinates(
      screenCoords.x, 
      screenCoords.y, 
      containerInfo, 
      gameState.dbImageWidth || 816, 
      gameState.dbImageHeight || 1224
    );
    
    // 수동 정답 표시
    createAnswerMarker(screenCoords, containerInfo, 'answer');
    
    console.log('💚 수동 정답 표시:', {
      클릭위치: `(${Math.round(screenCoords.x)}, ${Math.round(screenCoords.y)})`,
      DB기준변환: `(${Math.round(dbCoords.x)}, ${Math.round(dbCoords.y)})`,
      수동표시개수: document.querySelectorAll('.answer-marker.answer').length
    });
    
  } catch (error) {
    console.error('❌ 디버그 클릭 처리 중 오류:', error);
  }
}

/**
 * 하트 깨지기 효과 생성 (오답 클릭 시)
 */
function createHeartBreakEffect(screenCoords, containerInfo) {
  const container = containerInfo.container;
  
  // 1단계: X 표시 (0.6초간) - 크기 확대
  const heartContainer = document.createElement('div');
  heartContainer.className = 'heart-container'; // CSS 클래스명은 그대로 유지
  heartContainer.style.position = 'absolute';
  heartContainer.style.left = (containerInfo.imgStartX + screenCoords.x - 22.5) + 'px'; // -15px → -22.5px
  heartContainer.style.top = (containerInfo.imgStartY + screenCoords.y - 22.5) + 'px'; // -15px → -22.5px
  heartContainer.style.width = '45px'; // 30px → 45px
  heartContainer.style.height = '45px'; // 30px → 45px
  heartContainer.style.fontSize = '36px'; // 24px → 36px
  heartContainer.style.color = '#e74c3c';
  heartContainer.style.textAlign = 'center';
  heartContainer.style.lineHeight = '45px'; // 30px → 45px
  heartContainer.style.pointerEvents = 'none';
  heartContainer.style.zIndex = '1100';
  heartContainer.textContent = '❌'; // 💔 → ❌로 변경
  
  container.appendChild(heartContainer);
  
  // 2단계: 0.6초 후 X 표시 제거 및 조각들 생성
  setTimeout(() => {
    heartContainer.remove();
    
    // 하트 조각들 생성 (8개로 증가)
    for (let i = 1; i <= 8; i++) {
      // 조각 생성 시간차 (0~0.15초)
      const creationDelay = Math.random() * 150;
      
      setTimeout(() => {
        // 조각 시작 위치 (하트 주변에서 시작)
        const offsetX = (Math.random() - 0.5) * 25; // -12.5px ~ +12.5px (조금 더 넓게)
        const offsetY = (Math.random() - 0.5) * 25; // -12.5px ~ +12.5px
        
        // 각 조각마다 개별 컨테이너 생성
        const pieceContainer = document.createElement('div');
        pieceContainer.className = 'heart-piece-container';
        pieceContainer.style.left = (containerInfo.imgStartX + screenCoords.x + offsetX) + 'px';
        pieceContainer.style.top = (containerInfo.imgStartY + screenCoords.y + offsetY) + 'px';
        
        const piece = document.createElement('div');
        piece.className = `heart-piece heart-piece-${i}`;
        
        // 조각 크기 (하트 조각답게 작게)
        const size = Math.random() * 5 + 5; // 5~10px (조금 더 작게)
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        
        // 조각 색상 (빨강 계열 8가지)
        const colors = [
          '#e74c3c', // 진한 빨강
          '#c0392b', // 더 진한 빨강
          '#922b21', // 어두운 빨강
          '#641e16', // 매우 어두운 빨강
          '#7b241c', // 갈색 빨강
          '#a93226', // 중간 빨강
          '#78281f', // 어두운 갈색 빨강
          '#5d1f1a'  // 가장 어두운 빨강
        ];
        piece.style.backgroundColor = colors[i - 1];
        piece.style.borderRadius = '2px';
        
        pieceContainer.appendChild(piece);
        container.appendChild(pieceContainer);
        
        // 각 조각 개별적으로 제거 (1.8초 후 - 애니메이션 시간 고려)
        setTimeout(() => {
          if (pieceContainer.parentNode) {
            pieceContainer.parentNode.removeChild(pieceContainer);
          }
        }, 1800);
        
      }, creationDelay);
    }
    
  }, 600); // 하트 표시 0.6초 후 조각들 생성
  
  console.log('❌💥 X 표시 + 조각 흩어짐!', {
    위치: `(${Math.round(screenCoords.x)}, ${Math.round(screenCoords.y)})`,
    X표시시간: '0.6초',
    조각수: 8,
    효과: '명확한 오답 피드백!'
  });
}

// 전역 접근을 위한 export (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleImageClick,
    checkAnswer,
    handleCorrectAnswer,
    handleWrongAnswer,
    handleGameComplete,
    createAnswerMarker,
    createParticleEffect,
    createCorrectAreaMarker,
    debugClickHandler
  };
} 