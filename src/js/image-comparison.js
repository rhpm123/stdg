/**
 * 이미지 비교 모듈
 * 
 * 두 이미지를 비교하여 차이점을 감지하고 좌표를 추출하는 기능을 제공합니다.
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

/**
 * 이미지 데이터 객체
 * @typedef {Object} ImageData
 * @property {number} width - 이미지 너비
 * @property {number} height - 이미지 높이
 * @property {Uint8ClampedArray} data - 픽셀 데이터 배열 (RGBA)
 */

/**
 * 위치 좌표 객체
 * @typedef {Object} Coordinate
 * @property {number} x - X 좌표
 * @property {number} y - Y 좌표
 */

/**
 * 차이점 그룹 객체
 * @typedef {Object} DifferenceGroup
 * @property {Coordinate} center - 중심 좌표
 * @property {number} radius - 반경
 * @property {number} pixelCount - 픽셀 수
 * @property {Array<Coordinate>} pixels - 모든 픽셀 좌표
 */

/**
 * Canvas 컨텍스트에서 이미지 데이터를 추출합니다.
 * 
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {HTMLImageElement} image - 이미지 요소
 * @returns {ImageData} 이미지 데이터
 */
export const getImageDataFromCanvas = (canvas, image) => {
  const ctx = canvas.getContext('2d');
  
  // 캔버스 크기 설정
  canvas.width = image.width;
  canvas.height = image.height;
  
  // 이미지 그리기
  ctx.drawImage(image, 0, 0, image.width, image.height);
  
  // 이미지 데이터 추출
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * 두 이미지의 차이점을 픽셀 단위로 비교합니다.
 * 
 * @param {ImageData} imageData1 - 첫 번째 이미지 데이터
 * @param {ImageData} imageData2 - 두 번째 이미지 데이터
 * @param {number} [threshold=30] - 차이 임계값 (0-255)
 * @returns {Array<Coordinate>} 차이가 있는 픽셀 좌표 배열
 */
export const comparePixels = (imageData1, imageData2, threshold = 30) => {
  // 이미지 크기가 다르면 에러
  if (imageData1.width !== imageData2.width || imageData1.height !== imageData2.height) {
    throw new Error('두 이미지의 크기가 다릅니다');
  }
  
  const width = imageData1.width;
  const height = imageData1.height;
  const data1 = imageData1.data;
  const data2 = imageData2.data;
  const differentPixels = [];
  
  // 픽셀 단위로 비교
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4; // RGBA 값이므로 4를 곱함
      
      // RGB 각 채널의 차이 계산
      const rDiff = Math.abs(data1[index] - data2[index]);
      const gDiff = Math.abs(data1[index + 1] - data2[index + 1]);
      const bDiff = Math.abs(data1[index + 2] - data2[index + 2]);
      
      // 알파 채널은 무시하고 RGB 차이의 평균을 계산
      const avgDiff = (rDiff + gDiff + bDiff) / 3;
      
      // 임계값보다 차이가 크면 다른 픽셀로 판단
      if (avgDiff > threshold) {
        differentPixels.push({ x, y });
      }
    }
  }
  
  return differentPixels;
};

/**
 * 결과를 시각화하여 캔버스에 표시합니다.
 * 
 * @param {HTMLCanvasElement} canvas - 결과를 표시할 캔버스
 * @param {HTMLImageElement} baseImage - 기본 이미지
 * @param {Array<Coordinate>} differentPixels - 차이가 있는 픽셀 좌표 배열
 * @param {string} [highlightColor='rgba(255,0,0,0.5)'] - 강조 색상
 */
export const visualizeDifferences = (canvas, baseImage, differentPixels, highlightColor = 'rgba(255,0,0,0.5)') => {
  const ctx = canvas.getContext('2d');
  
  // 캔버스 크기 설정
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;
  
  // 기본 이미지 그리기
  ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);
  
  // 차이 픽셀 강조 표시
  ctx.fillStyle = highlightColor;
  
  differentPixels.forEach(pixel => {
    ctx.fillRect(pixel.x, pixel.y, 1, 1);
  });
};

/**
 * 연결된 픽셀 그룹화 (연결 컴포넌트 라벨링)
 * 
 * @param {Array<Coordinate>} pixels - 픽셀 좌표 배열
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @param {number} [distance=1] - 인접 픽셀 간 최대 거리
 * @returns {Array<Array<Coordinate>>} 그룹화된 픽셀 배열
 */
export const groupConnectedPixels = (pixels, width, height, distance = 1) => {
  if (pixels.length === 0) return [];
  
  // 픽셀 위치를 빠르게 검색하기 위한 맵 생성
  const pixelMap = new Map();
  pixels.forEach(pixel => {
    const key = `${pixel.x},${pixel.y}`;
    pixelMap.set(key, pixel);
  });
  
  // 방문한 픽셀을 추적
  const visited = new Set();
  const groups = [];
  
  // 픽셀의 이웃을 찾는 함수
  const getNeighbors = (pixel) => {
    const neighbors = [];
    
    // 주변 픽셀 검사 (distance에 따라 범위 조정)
    for (let dy = -distance; dy <= distance; dy++) {
      for (let dx = -distance; dx <= distance; dx++) {
        // 자기 자신은 건너뜀
        if (dx === 0 && dy === 0) continue;
        
        const nx = pixel.x + dx;
        const ny = pixel.y + dy;
        
        // 이미지 범위 내에 있고, 아직 방문하지 않은 픽셀인지 확인
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const key = `${nx},${ny}`;
          
          if (pixelMap.has(key) && !visited.has(key)) {
            neighbors.push(pixelMap.get(key));
          }
        }
      }
    }
    
    return neighbors;
  };
  
  // BFS로 연결된 컴포넌트 찾기
  pixels.forEach(pixel => {
    const key = `${pixel.x},${pixel.y}`;
    
    if (!visited.has(key)) {
      const group = [];
      const queue = [pixel];
      visited.add(key);
      
      while (queue.length > 0) {
        const current = queue.shift();
        group.push(current);
        
        const neighbors = getNeighbors(current);
        neighbors.forEach(neighbor => {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          visited.add(neighborKey);
          queue.push(neighbor);
        });
      }
      
      groups.push(group);
    }
  });
  
  return groups;
};

/**
 * 픽셀 그룹에서 중심 좌표와 반경을 계산합니다.
 * 
 * @param {Array<Coordinate>} pixelGroup - 픽셀 그룹
 * @returns {DifferenceGroup} 차이점 그룹 정보
 */
export const calculateCenterAndRadius = (pixelGroup) => {
  if (pixelGroup.length === 0) {
    throw new Error('픽셀 그룹이 비어있습니다');
  }
  
  // 중심 좌표 계산 (평균)
  let sumX = 0;
  let sumY = 0;
  
  pixelGroup.forEach(pixel => {
    sumX += pixel.x;
    sumY += pixel.y;
  });
  
  const centerX = Math.round(sumX / pixelGroup.length);
  const centerY = Math.round(sumY / pixelGroup.length);
  
  // 반경 계산 (중심에서 가장 먼 픽셀까지의 거리)
  let maxDistance = 0;
  
  pixelGroup.forEach(pixel => {
    const distance = Math.sqrt(
      Math.pow(pixel.x - centerX, 2) + Math.pow(pixel.y - centerY, 2)
    );
    
    if (distance > maxDistance) {
      maxDistance = distance;
    }
  });
  
  // 사용자 클릭 오차를 고려한 최소 반경 보장
  const radius = Math.max(Math.ceil(maxDistance), 20);
  
  return {
    center: { x: centerX, y: centerY },
    radius,
    pixelCount: pixelGroup.length,
    pixels: pixelGroup
  };
};

/**
 * 픽셀 그룹 필터링 (노이즈 제거)
 * 
 * @param {Array<Array<Coordinate>>} groups - 픽셀 그룹 배열
 * @param {number} [minSize=10] - 최소 픽셀 수
 * @returns {Array<Array<Coordinate>>} 필터링된 그룹 배열
 */
export const filterGroups = (groups, minSize = 10) => {
  return groups.filter(group => group.length >= minSize);
};

/**
 * 전체 차이점 분석 프로세스를 실행합니다.
 * 
 * @param {HTMLImageElement} originalImage - 원본 이미지
 * @param {HTMLImageElement} modifiedImage - 수정된 이미지
 * @param {Object} [options={}] - 옵션
 * @param {number} [options.threshold=30] - 픽셀 차이 임계값
 * @param {number} [options.minGroupSize=10] - 최소 그룹 크기
 * @param {number} [options.neighborDistance=1] - 이웃 픽셀 거리
 * @returns {Promise<Array<DifferenceGroup>>} 차이점 그룹 배열
 */
export const analyzeImageDifferences = async (originalImage, modifiedImage, options = {}) => {
  const {
    threshold = 30,
    minGroupSize = 10,
    neighborDistance = 1
  } = options;
  
  // 캔버스 생성
  const canvas1 = document.createElement('canvas');
  const canvas2 = document.createElement('canvas');
  
  // 이미지 데이터 추출
  const imageData1 = getImageDataFromCanvas(canvas1, originalImage);
  const imageData2 = getImageDataFromCanvas(canvas2, modifiedImage);
  
  // 픽셀 비교
  const differentPixels = comparePixels(imageData1, imageData2, threshold);
  
  // 픽셀 그룹화
  const groups = groupConnectedPixels(
    differentPixels,
    originalImage.width,
    originalImage.height,
    neighborDistance
  );
  
  // 작은 그룹 필터링 (노이즈 제거)
  const filteredGroups = filterGroups(groups, minGroupSize);
  
  // 각 그룹의 중심점과 반경 계산
  const differenceGroups = filteredGroups.map(group => 
    calculateCenterAndRadius(group)
  );
  
  return differenceGroups;
};

export default {
  getImageDataFromCanvas,
  comparePixels,
  visualizeDifferences,
  groupConnectedPixels,
  calculateCenterAndRadius,
  filterGroups,
  analyzeImageDifferences
}; 