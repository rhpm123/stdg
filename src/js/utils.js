/**
 * 유틸리티 함수 모듈
 * 
 * 애플리케이션 전반에서 사용되는 유틸리티 함수들을 제공합니다.
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

/**
 * 시간(초)을 MM:SS 형식의 문자열로 변환합니다.
 * 
 * @param {number} seconds - 변환할 시간(초)
 * @returns {string} MM:SS 형식의 시간 문자열
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * 난이도 숫자를 텍스트로 변환합니다.
 * 
 * @param {number} difficulty - 난이도 (1~5)
 * @returns {string} 난이도 텍스트
 */
export const difficultyToText = (difficulty) => {
  const difficultyTexts = {
    1: '쉬움',
    2: '보통',
    3: '어려움',
    4: '매우 어려움',
    5: '극한'
  };
  
  return difficultyTexts[difficulty] || '알 수 없음';
};

/**
 * 두 점 사이의 거리를 계산합니다.
 * 
 * @param {number} x1 - 첫 번째 점의 x 좌표
 * @param {number} y1 - 첫 번째 점의 y 좌표
 * @param {number} x2 - 두 번째 점의 x 좌표
 * @param {number} y2 - 두 번째 점의 y 좌표
 * @returns {number} 두 점 사이의 거리
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * 이미지 URL의 유효성을 확인합니다.
 * 
 * @param {string} url - 확인할 이미지 URL
 * @returns {Promise<boolean>} 이미지 URL 유효성 여부
 */
export const isValidImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    img.src = url;
  });
};

/**
 * 점수를 계산합니다.
 * 
 * @param {number} baseScore - 기본 점수
 * @param {number} difficulty - 난이도 (1~5)
 * @param {number} timeBonus - 시간 보너스
 * @returns {number} 계산된 점수
 */
export const calculateScore = (baseScore, difficulty, timeBonus) => {
  // 난이도 배율 계산
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2; // 1.0 ~ 1.8
  
  // 시간 보너스 적용
  const timeBonusPoints = timeBonus * difficulty * 10;
  
  // 최종 점수 계산
  const finalScore = Math.round((baseScore * difficultyMultiplier) + timeBonusPoints);
  
  return finalScore;
};

/**
 * 이미지 크기를 조정하여 반환합니다.
 * 
 * @param {HTMLImageElement} image - 원본 이미지 요소
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @returns {Object} 조정된 너비와 높이
 */
export const calculateAspectRatioFit = (image, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
  
  return {
    width: image.width * ratio,
    height: image.height * ratio
  };
};

/**
 * 파일을 이미지로 로드합니다.
 * 
 * @param {File} file - 로드할 파일
 * @returns {Promise<HTMLImageElement>} 로드된 이미지
 */
export const loadFileAsImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    
    reader.readAsDataURL(file);
  });
};

export default {
  formatTime,
  difficultyToText,
  calculateDistance,
  isValidImageUrl,
  calculateScore,
  calculateAspectRatioFit,
  loadFileAsImage
}; 