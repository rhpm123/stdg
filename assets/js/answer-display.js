/**
 * 틀린그림찾기 게임 - 정답 영역 시각화 모듈
 * 정답 영역 표시 및 제거를 담당합니다.
 */

/**
 * 정답 영역 표시
 */
function displayAnswerPoints() {
  const container = document.getElementById('modifiedContainer');
  const img = document.getElementById('modifiedImage');
  
  if (!container || !img || !gameState.answerPoints) {
    console.log('⚠️ 정답 영역 시각화 실패: 요소 또는 데이터 누락');
    return;
  }
  
  // 기존 점들 제거
  removeAnswerPoints();
  
  console.log('🌈 정답 영역 시각화 시작:', gameState.answerPoints.length, '개 영역');
  
  // coordinate-utils.js의 정확한 계산 함수 사용
  const containerInfo = getImageContainerInfo('modifiedContainer', 'modifiedImage');
  
  // 강제로 DB 설정 크기 사용 (정답 좌표가 이 크기 기준으로 생성됨)
  const forceDbWidth = gameState.dbImageWidth || 816;
  const forceDbHeight = gameState.dbImageHeight || 1224;
  
  console.log('🔍 DB 이미지 크기 확인:', {
    'gameState.dbImageWidth': gameState.dbImageWidth,
    'gameState.dbImageHeight': gameState.dbImageHeight,
    'img.naturalWidth': img.naturalWidth,
    'img.naturalHeight': img.naturalHeight,
    '최종_dbWidth': forceDbWidth,
    '최종_dbHeight': forceDbHeight
  });
  
  console.log('⚠️ 강제 DB 크기 사용:', {
    '강제_dbWidth': forceDbWidth,
    '강제_dbHeight': forceDbHeight,
    '계산된_표시크기': `${Math.round(containerInfo.imgDisplayWidth)}x${Math.round(containerInfo.imgDisplayHeight)}`,
    '계산된_시작점': `(${containerInfo.imgStartX.toFixed(1)}, ${containerInfo.imgStartY.toFixed(1)})`
  });
  
  const scaleX = containerInfo.imgDisplayWidth / forceDbWidth;
  const scaleY = containerInfo.imgDisplayHeight / forceDbHeight;
  
  console.log('📈 정답 영역 시각화 좌표 기준:', {
    DB크기: `${forceDbWidth}x${forceDbHeight}`,
    컨테이너크기: `${containerInfo.containerWidth}x${containerInfo.containerHeight}`,
    표시크기: `${Math.round(containerInfo.imgDisplayWidth)}x${Math.round(containerInfo.imgDisplayHeight)}`,
    natural크기: `${img.naturalWidth}x${img.naturalHeight}`,
    이미지시작점: `(${containerInfo.imgStartX.toFixed(1)}, ${containerInfo.imgStartY.toFixed(1)})`,
    scale: `(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`,
    DB첫번째점: gameState.answerPoints[0] ? `(${gameState.answerPoints[0][0].x}, ${gameState.answerPoints[0][0].y})` : 'N/A'
  });
  
  // 첫 번째 정답 좌표 변환 테스트
  if (gameState.answerPoints[0] && gameState.answerPoints[0][0]) {
    const firstPoint = gameState.answerPoints[0][0];
    const testScreenX = firstPoint.x * scaleX;
    const testScreenY = firstPoint.y * scaleY;
    const testDisplayX = containerInfo.imgStartX + testScreenX;
    const testDisplayY = containerInfo.imgStartY + testScreenY;
    
    console.log('🎯 첫 번째 정답 좌표 변환 테스트:', {
      DB좌표: `(${firstPoint.x}, ${firstPoint.y})`,
      스케일적용: `(${testScreenX.toFixed(1)}, ${testScreenY.toFixed(1)})`,
      최종표시위치: `(${testDisplayX.toFixed(1)}, ${testDisplayY.toFixed(1)})`,
      예상위치: '이미지 우상단 근처여야 함'
    });
  }
  
  // 각 영역의 모든 점을 표시 (샘플링으로 성능 최적화)
  gameState.answerPoints.forEach((region, regionIndex) => {
    if (!region || region.length === 0) return;
    
    console.log(`🎯 영역 ${regionIndex} 시각화:`, {
      점개수: region.length,
      첫번째점: `(${region[0].x}, ${region[0].y})`,
      마지막점: `(${region[region.length-1].x}, ${region[region.length-1].y})`
    });
    
    // 성능을 위해 점을 간격을 두고 표시 (너무 많으면 느려짐)
    const step = Math.max(1, Math.floor(region.length / 20)); // 최대 20개 점만 표시
    
    for (let i = 0; i < region.length; i += step) {
      const point = region[i];
      
      // DB 좌표를 화면 좌표로 변환
      const screenX = point.x * scaleX;
      const screenY = point.y * scaleY;
      
      // 컨테이너 기준 절대 좌표
      const displayX = containerInfo.imgStartX + screenX;
      const displayY = containerInfo.imgStartY + screenY;
      
      // 정답 점 생성
      createAnswerPoint(container, displayX, displayY, regionIndex);
    }
  });
  
  console.log('✅ 정답 영역 시각화 완료');
  showAnswers = true;
}

/**
 * 정답 점 생성
 */
function createAnswerPoint(container, x, y, regionIndex) {
  const point = document.createElement('div');
  point.className = 'answer-point';
  point.style.position = 'absolute';
  point.style.left = (x - 3) + 'px';
  point.style.top = (y - 3) + 'px';
  point.style.width = '6px';
  point.style.height = '6px';
  point.style.borderRadius = '50%';
  point.style.pointerEvents = 'none';
  point.style.zIndex = '999';
  
  // 영역별 색상 구분
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
  const color = colors[regionIndex % colors.length];
  point.style.backgroundColor = color;
  point.style.border = '1px solid rgba(255,255,255,0.8)';
  point.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
  
  container.appendChild(point);
}

/**
 * 정답 영역 제거
 */
function removeAnswerPoints() {
  const points = document.querySelectorAll('.answer-point');
  points.forEach(point => point.remove());
  
  const markers = document.querySelectorAll('.answer-marker');
  markers.forEach(marker => marker.remove());
  
  // 체크 마킹도 함께 제거
  const checkMarkers = document.querySelectorAll('.correct-area-marker');
  checkMarkers.forEach(marker => marker.remove());
  
  showAnswers = false;
  console.log('🧹 정답 영역 제거 완료 (체크 마킹 포함)');
}

/**
 * 정답 영역 토글
 */
function toggleAnswerPoints() {
  if (showAnswers) {
    removeAnswerPoints();
    showMessage('정답 영역을 숨겼습니다.', 'success');
  } else {
    displayAnswerPoints();
    showMessage('정답 영역을 표시했습니다.', 'success');
  }
  
  // 버튼 텍스트 업데이트
  const toggleBtn = document.getElementById('toggleAnswerBtn');
  if (toggleBtn) {
    toggleBtn.textContent = showAnswers ? '정답 영역 숨김' : '정답 영역 표시';
  }
}

/**
 * 정답 영역 상태 확인
 */
function isAnswerPointsVisible() {
  return showAnswers;
}

/**
 * 정답 영역 강제 숨김 (게임 시작 시 사용)
 */
function hideAnswerPoints() {
  if (showAnswers) {
    removeAnswerPoints();
    
    const toggleBtn = document.getElementById('toggleAnswerBtn');
    if (toggleBtn) {
      toggleBtn.textContent = '정답 영역 표시';
    }
  }
}

/**
 * 정답 영역 힌트 (깜빡임)
 */
function showAnswerHint(regionIndex = -1) {
  const container = document.getElementById('modifiedContainer');
  const containerInfo = getImageContainerInfo('modifiedContainer', 'modifiedImage');
  
  if (!container || !gameState.answerPoints) return;
  
  // 강제로 DB 설정 크기 사용
  const forceDbWidth = gameState.dbImageWidth || 816;
  const forceDbHeight = gameState.dbImageHeight || 1224;
  const scaleX = containerInfo.imgDisplayWidth / forceDbWidth;
  const scaleY = containerInfo.imgDisplayHeight / forceDbHeight;
  
  // 기존 힌트 제거
  document.querySelectorAll('.answer-highlight.hint').forEach(el => el.remove());
  
  // 특정 영역만 힌트 표시 (regionIndex >= 0) 또는 모든 미발견 영역 표시
  const regionsToShow = regionIndex >= 0 ? [regionIndex] : 
    gameState.answerPoints.map((_, idx) => idx).filter(idx => !gameState.foundPoints.includes(idx));
  
  regionsToShow.forEach(idx => {
    if (gameState.foundPoints.includes(idx)) return; // 이미 발견된 영역은 제외
    
    const region = gameState.answerPoints[idx];
    if (!region || region.length === 0) return;
    
    // 영역의 중심점 계산
    const center = getRegionCenter(region);
    const screenX = center.x * scaleX;
    const screenY = center.y * scaleY;
    const displayX = containerInfo.imgStartX + screenX;
    const displayY = containerInfo.imgStartY + screenY;
    
    // 힌트 영역 생성 (더 큰 원)
    const hint = document.createElement('div');
    hint.className = 'answer-highlight hint';
    hint.style.position = 'absolute';
    hint.style.left = (displayX - 25) + 'px';
    hint.style.top = (displayY - 25) + 'px';
    hint.style.width = '50px';
    hint.style.height = '50px';
    hint.style.borderRadius = '50%';
    hint.style.border = '2px solid rgba(255, 165, 0, 0.8)';
    hint.style.pointerEvents = 'none';
    hint.style.zIndex = '998';
    
    container.appendChild(hint);
  });
  
  console.log('💡 힌트 표시:', {
    표시영역: regionsToShow.length,
    전체영역: gameState.answerPoints.length,
    발견영역: gameState.foundPoints.length
  });
  
  // 3초 후 힌트 제거
  setTimeout(() => {
    document.querySelectorAll('.answer-highlight.hint').forEach(el => el.remove());
  }, 3000);
}

/**
 * 게임 완료 시 모든 정답 영역 축하 깜빡임
 */
function celebrateAllAnswers() {
  if (!gameState.answerPoints) return;
  
  const container = document.getElementById('modifiedContainer');
  const containerInfo = getImageContainerInfo('modifiedContainer', 'modifiedImage');
  
  // 순차적으로 각 영역을 깜빡이게 함
  gameState.answerPoints.forEach((region, idx) => {
    setTimeout(() => {
      // 해당 영역의 모든 마커에 축하 효과 추가
      const markers = document.querySelectorAll('.answer-marker.correct');
      if (markers[idx]) {
        markers[idx].classList.add('blink');
        setTimeout(() => {
          markers[idx].classList.remove('blink');
        }, 1500);
      }
    }, idx * 300); // 300ms씩 지연
  });
  
  console.log('🎉 게임 완료 축하 애니메이션!');
}


/**
 * 틀린부분 이미지 교차 깜빡임 효과 (영역별 독립 처리)
 */
function showDifferenceBlinking(regionIndex = -1, duration = 5000) {
  const originalImg = document.getElementById('originalImage');
  const modifiedImg = document.getElementById('modifiedImage');
  const modifiedContainer = document.getElementById('modifiedContainer');
  
  if (!originalImg || !modifiedImg || !modifiedContainer || !gameState.answerPoints) {
    console.log('⚠️ 이미지 교차 깜빡임 실패: 요소 누락');
    return;
  }
  
  // 특정 영역만 깜빡임할 때는 기존 깜빡임을 제거하지 않음 (독립적 처리)
  if (regionIndex >= 0) {
    // 해당 영역의 기존 깜빡임만 제거 (다른 영역은 유지)
    const existingOverlay = document.querySelector(`.difference-blink-overlay[data-region="${regionIndex}"]`);
    if (existingOverlay) {
      existingOverlay.remove();
      console.log(`🔄 영역 ${regionIndex} 기존 깜빡임 교체`);
    }
  } else {
    // 전체 깜빡임일 때만 모든 기존 깜빡임 제거
    document.querySelectorAll('.difference-blink-overlay').forEach(el => el.remove());
    console.log('🔄 전체 영역 깜빡임 - 기존 깜빡임 모두 제거');
  }
    
  const containerInfo = getImageContainerInfo('modifiedContainer', 'modifiedImage');
  const forceDbWidth = gameState.dbImageWidth || 816;
  const forceDbHeight = gameState.dbImageHeight || 1224;
  const scaleX = containerInfo.imgDisplayWidth / forceDbWidth;
  const scaleY = containerInfo.imgDisplayHeight / forceDbHeight;
  
  // 특정 영역만 깜빡임 또는 모든 미발견 영역 깜빡임
  const regionsToShow = regionIndex >= 0 ? [regionIndex] : 
    gameState.answerPoints.map((_, idx) => idx).filter(idx => !gameState.foundPoints.includes(idx));
  
  console.log('🔍 깜빡임 대상 영역 분석:', {
    요청된영역: regionIndex,
    전체영역수: gameState.answerPoints.length,
    찾은영역들: gameState.foundPoints,
    깜빡일영역들: regionsToShow,
    영역4상태: gameState.foundPoints.includes(4) ? '찾음' : '미발견'
  });
  
  regionsToShow.forEach(idx => {
    const region = gameState.answerPoints[idx];
    if (!region || region.length === 0) return;
    
    // 영역의 바운딩 박스 계산
    const bounds = getRegionBounds(region);
    const padding = 10; // 영역 주변 여백
    
    // 화면 좌표로 변환
    const screenX1 = (bounds.minX - padding) * scaleX;
    const screenY1 = (bounds.minY - padding) * scaleY;
    const screenX2 = (bounds.maxX + padding) * scaleX;
    const screenY2 = (bounds.maxY + padding) * scaleY;
    
    const width = screenX2 - screenX1;
    const height = screenY2 - screenY1;
    
    // 컨테이너 기준 절대 좌표
    const displayX = containerInfo.imgStartX + screenX1;
    const displayY = containerInfo.imgStartY + screenY1;
    
    // 원본 이미지의 해당 영역 오버레이 생성
    createDifferenceOverlay(
      modifiedContainer, 
      displayX, 
      displayY, 
      width, 
      height,
      originalImg.src,
      bounds,
      containerInfo,
      idx
    );
  });
  
  console.log('💡 틀린부분 이미지 깜빡임:', {
    표시영역: regionsToShow.length,
    전체영역: gameState.answerPoints.length,
    지속시간: duration + 'ms',
    오버레이수: document.querySelectorAll('.difference-blink-overlay').length
  });
  
  // 영역별 독립적인 자동 제거 설정
  if (regionIndex >= 0) {
    // 특정 영역만 지정된 시간 후 제거
    setTimeout(() => {
      const targetOverlay = document.querySelector(`.difference-blink-overlay[data-region="${regionIndex}"]`);
      if (targetOverlay) {
        targetOverlay.remove();
        console.log(`⌚ 영역 ${regionIndex} 깜빡임 종료`);
      }
    }, duration);
  } else {
    // 전체 깜빡임일 때 모든 오버레이 제거
    setTimeout(() => {
      document.querySelectorAll('.difference-blink-overlay').forEach(el => el.remove());
      console.log('⌚ 전체 영역 깜빡임 종료');
    }, duration);
  }
}

/**
 * 영역의 바운딩 박스 계산
 */
function getRegionBounds(region) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  region.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  return { minX, minY, maxX, maxY };
}

/**
 /**
  * 이미지 교차 오버레이 생성
  */
 function createDifferenceOverlay(container, x, y, width, height, originalSrc, bounds, containerInfo, regionIndex) {
   // 원본 이미지 오버레이 (깜빡일 때 보임)
   const overlay = document.createElement('div');
   overlay.className = 'difference-blink-overlay active';
   console.log(`🎨 오버레이 ${regionIndex} 생성! 클래스: ${overlay.className}, 애니메이션 시작!`);
   overlay.style.left = x + 'px';
   overlay.style.top = y + 'px';
   overlay.style.width = width + 'px';
   overlay.style.height = height + 'px';
   
   // 배경색 제거 - 원본 이미지가 보이도록
   // overlay.style.backgroundColor = 'rgba(255, 255, 0, 0.9)'; // 주석 처리
   
   // 원본 이미지의 해당 영역만 크롭해서 배경으로 설정
   const forceDbWidth = gameState.dbImageWidth || 816;
   const forceDbHeight = gameState.dbImageHeight || 1224;
   const scaleX = containerInfo.imgDisplayWidth / forceDbWidth;
   const scaleY = containerInfo.imgDisplayHeight / forceDbHeight;
   
   // 간단한 배경 이미지 설정 (전체 이미지 표시)
   overlay.style.backgroundImage = `url(${originalSrc})`;
   overlay.style.backgroundSize = `${containerInfo.imgDisplayWidth}px ${containerInfo.imgDisplayHeight}px`;
   
   // 배경 이미지 위치 조정 (해당 영역만 보이도록)
   const bgOffsetX = -(x - containerInfo.imgStartX);
   const bgOffsetY = -(y - containerInfo.imgStartY);
   overlay.style.backgroundPosition = `${bgOffsetX}px ${bgOffsetY}px`;
   
   console.log(`🖼️ 배경 이미지 설정 완료!`, {
     원본이미지: originalSrc,
     배경크기: `${containerInfo.imgDisplayWidth}x${containerInfo.imgDisplayHeight}`,
     배경위치: `${bgOffsetX}px ${bgOffsetY}px`,
     오버레이위치: `${x}px ${y}px`,
     오버레이크기: `${width}px ${height}px`
   });
   
   // 영역별 색상 구분 (테두리 제거)
   /*
   const colors = [
     'rgba(255, 0, 0, 0.8)',     // 빨간
     'rgba(255, 255, 0, 0.8)',   // 노란
     'rgba(0, 255, 0, 0.8)',     // 초록
     'rgba(0, 255, 255, 0.8)',   // 청록
     'rgba(255, 0, 255, 0.8)',   // 자주
     'rgba(255, 165, 0, 0.8)'    // 주황
   ];
   overlay.style.borderColor = colors[regionIndex % colors.length];
   overlay.style.borderWidth = '3px';
   overlay.style.borderStyle = 'solid';
   */
   
   // 강조 효과 제거 - blinkDifference 애니메이션과 충돌
   // overlay.classList.add('glow'); // 주석 처리
   // overlay.classList.add('glow'); // 완전히 제거
   
   // 디버그를 위한 데이터 속성
   overlay.setAttribute('data-region', regionIndex);
   overlay.setAttribute('data-bounds', JSON.stringify(bounds));
   
   // DOM에 추가 (중복 제거)
   container.appendChild(overlay);
   
   // 오버레이 생성 후 상태 확인
   console.log(`✅ 오버레이 ${regionIndex} DOM에 추가 완료!`, {
     부모: container.tagName,
     오버레이클래스: overlay.className,
     애니메이션: getComputedStyle(overlay).animation,
     위치: `${overlay.style.left} ${overlay.style.top}`,
     크기: `${overlay.style.width} ${overlay.style.height}`,
     배경이미지: overlay.style.backgroundImage ? '설정됨' : '없음'
   });
   
   console.log(`🎨 영역 ${regionIndex} 교차 오버레이 생성:`, {
     위치: `(${Math.round(x)}, ${Math.round(y)})`,
     크기: `${Math.round(width)}x${Math.round(height)}`,
     배경오프셋: `(${bgOffsetX}, ${bgOffsetY})`,
     배경크기: `${containerInfo.imgDisplayWidth}x${containerInfo.imgDisplayHeight}`,
     요소클래스: overlay.className,
     바운딩: bounds
   });
}

// 전역 접근을 위한 export (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
  displayAnswerPoints,
  createAnswerPoint,
  removeAnswerPoints,
  toggleAnswerPoints,
  isAnswerPointsVisible,
  hideAnswerPoints,
  showAnswerHint,
  celebrateAllAnswers,
  showDifferenceBlinking,
  getRegionBounds,
  createDifferenceOverlay
};
}
   