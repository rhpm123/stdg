/**
 * 틀린그림찾기 게임 - 좌표 변환 유틸리티
 * 화면 좌표와 DB 좌표 간의 변환을 담당합니다.
 */

/**
 * 이미지 컨테이너 정보 가져오기
 */
function getImageContainerInfo(containerId, imageId) {
  const container = document.getElementById(containerId);
  const img = document.getElementById(imageId);
  
  if (!container || !img) {
    throw new Error('컨테이너 또는 이미지 요소를 찾을 수 없습니다.');
  }
  
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // object-fit: contain이 적용된 이미지의 실제 표시 크기 계산
  const imageNaturalWidth = img.naturalWidth;
  const imageNaturalHeight = img.naturalHeight;
  
  // 컨테이너에 맞는 스케일 계산 (더 작은 값 선택)
  const scaleX = containerWidth / imageNaturalWidth;
  const scaleY = containerHeight / imageNaturalHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // 실제 이미지 표시 크기
  const imgDisplayWidth = imageNaturalWidth * scale;
  const imgDisplayHeight = imageNaturalHeight * scale;
  
  // object-fit: contain으로 인해 중앙 정렬된 이미지의 실제 시작점
  const imgStartX = (containerWidth - imgDisplayWidth) / 2;
  const imgStartY = (containerHeight - imgDisplayHeight) / 2;
  
  console.log('🔧 object-fit: contain 이미지 크기 재계산:', {
    컨테이너크기: `${containerWidth}x${containerHeight}`,
    natural크기: `${imageNaturalWidth}x${imageNaturalHeight}`,
    계산된스케일: scale.toFixed(3),
    실제표시크기: `${Math.round(imgDisplayWidth)}x${Math.round(imgDisplayHeight)}`,
    이미지시작점: `(${imgStartX.toFixed(1)}, ${imgStartY.toFixed(1)})`,
    기존client크기: `${img.clientWidth}x${img.clientHeight}`
  });
  
  return {
    container,
    img,
    containerWidth,
    containerHeight,
    imgDisplayWidth,
    imgDisplayHeight,
    imgStartX,
    imgStartY
  };
}

/**
 * 마우스 이벤트를 이미지 상대 좌표로 변환
 */
function eventToImageCoordinates(event, containerInfo) {
  const { container, imgStartX, imgStartY, imgDisplayWidth, imgDisplayHeight } = containerInfo;
  
  // 컨테이너 기준 마우스 좌표
  const containerRect = container.getBoundingClientRect();
  const containerX = event.clientX - containerRect.left;
  const containerY = event.clientY - containerRect.top;
  
  // 이미지 내에서의 상대적 좌표 (이미지 시작점 기준)
  const x = containerX - imgStartX;
  const y = containerY - imgStartY;
  
  // 마우스 클릭이 이미지 영역 내에 있는지 확인
  const isWithinImage = x >= 0 && y >= 0 && x <= imgDisplayWidth && y <= imgDisplayHeight;
  
  return {
    x,
    y,
    containerX,
    containerY,
    isWithinImage
  };
}

/**
 * 화면 좌표를 DB 좌표로 변환
 */
function screenToDbCoordinates(screenX, screenY, containerInfo, dbWidth, dbHeight) {
  const { imgDisplayWidth, imgDisplayHeight } = containerInfo;
  
  // 스케일 계산: 화면 좌표를 DB 좌표로 변환 (확대)
  const scaleX = dbWidth / imgDisplayWidth;
  const scaleY = dbHeight / imgDisplayHeight;
  
  const dbX = screenX * scaleX;
  const dbY = screenY * scaleY;
  
  return {
    x: dbX,
    y: dbY,
    scaleX,
    scaleY
  };
}

/**
 * DB 좌표를 화면 좌표로 변환
 */
function dbToScreenCoordinates(dbX, dbY, containerInfo, dbWidth, dbHeight) {
  const { imgDisplayWidth, imgDisplayHeight, imgStartX, imgStartY } = containerInfo;
  
  // 스케일 계산: DB 좌표를 화면 좌표로 변환 (축소)
  const scaleX = imgDisplayWidth / dbWidth;
  const scaleY = imgDisplayHeight / dbHeight;
  
  const scaledX = dbX * scaleX;
  const scaledY = dbY * scaleY;
  
  // 이미지 시작점 오프셋 적용
  const displayX = imgStartX + scaledX;
  const displayY = imgStartY + scaledY;
  
  return {
    x: displayX,
    y: displayY,
    scaledX,
    scaledY,
    scaleX,
    scaleY
  };
}

/**
 * 두 점 사이의 거리 계산
 */
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * 영역의 중심점 계산
 */
function getRegionCenter(region) {
  if (!region || region.length === 0) {
    return { x: 0, y: 0 };
  }
  
  let sumX = 0, sumY = 0;
  region.forEach(point => {
    sumX += point.x;
    sumY += point.y;
  });
  
  return {
    x: sumX / region.length,
    y: sumY / region.length
  };
}

/**
 * 디버그 정보 로깅
 */
function logCoordinateDebugInfo(screenCoords, dbCoords, containerInfo, dbWidth, dbHeight) {
  console.log('📍 좌표 변환 상세:', {
    컨테이너클릭: `(${Math.round(screenCoords.containerX)}, ${Math.round(screenCoords.containerY)})`,
    이미지시작점: `(${Math.round(containerInfo.imgStartX)}, ${Math.round(containerInfo.imgStartY)})`,
    이미지상대좌표: `(${Math.round(screenCoords.x)}, ${Math.round(screenCoords.y)})`,
    DB기준변환: `(${Math.round(dbCoords.x)}, ${Math.round(dbCoords.y)})`,
    scale: `(${dbCoords.scaleX.toFixed(3)}, ${dbCoords.scaleY.toFixed(3)})`,
    DB크기: `${dbWidth}x${dbHeight}`,
    natural크기: `${containerInfo.img.naturalWidth}x${containerInfo.img.naturalHeight}`,
    표시크기: `${containerInfo.imgDisplayWidth}x${containerInfo.imgDisplayHeight}`,
    컨테이너크기: `${containerInfo.containerWidth}x${containerInfo.containerHeight}`
  });
}

// 전역 접근을 위한 export (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getImageContainerInfo,
    eventToImageCoordinates,
    screenToDbCoordinates,
    dbToScreenCoordinates,
    calculateDistance,
    getRegionCenter,
    logCoordinateDebugInfo
  };
} 