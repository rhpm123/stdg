/**
 * 틀린그림찾기 게임 - API 클라이언트
 * 서버와의 통신을 담당합니다.
 */

// API 기본 설정
const API_BASE_URL = '';
const API_TIMEOUT = 10000; // 10초

/**
 * 공통 fetch 함수 (타임아웃 및 오류 처리 포함)
 */
async function apiCall(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(API_BASE_URL + url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    
    console.error('API 호출 오류:', error);
    throw error;
  }
}

/**
 * 이미지 세트 목록 가져오기
 */
async function fetchImageSets() {
  try {
    console.log('📡 이미지 세트 목록 요청...');
    const data = await apiCall('/api/image-sets');
    console.log('📦 이미지 세트 데이터 수신:', data.length, '개');
    return data;
  } catch (error) {
    console.error('❌ 이미지 세트 로드 오류:', error);
    throw new Error(`이미지 세트 데이터를 가져올 수 없습니다: ${error.message}`);
  }
}

/**
 * 특정 이미지 세트의 정답 데이터 가져오기
 */
async function fetchAnswerPoints(imageSetId) {
  try {
    console.log('📡 정답 데이터 요청:', imageSetId);
    const data = await apiCall(`/api/answer-points/${imageSetId}`);
    console.log('🎯 정답 데이터 수신:', {
      regions: data.regions?.length || 0,
      imageSize: `${data.image_width}x${data.image_height}`
    });
    return data;
  } catch (error) {
    console.error('❌ 정답 데이터 로드 오류:', error);
    throw new Error(`정답 데이터를 가져올 수 없습니다: ${error.message}`);
  }
}

/**
 * 서버 상태 확인
 */
async function checkServerHealth() {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('서버 상태 확인 실패:', error);
    return false;
  }
}

/**
 * 게임 결과 저장 (향후 확장용)
 */
async function saveGameResult(gameData) {
  try {
    console.log('💾 게임 결과 저장 시도...');
    const data = await apiCall('/api/game-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    });
    console.log('✅ 게임 결과 저장 완료');
    return data;
  } catch (error) {
    console.error('❌ 게임 결과 저장 실패:', error);
    // 저장 실패는 게임 진행에 영향을 주지 않으므로 에러를 throw하지 않음
    return null;
  }
}

/**
 * API 연결 테스트
 */
async function testApiConnection() {
  try {
    console.log('🔍 API 연결 테스트 시작...');
    
    // 이미지 세트 API 테스트
    const imageSets = await fetchImageSets();
    if (!imageSets || imageSets.length === 0) {
      throw new Error('이미지 세트 데이터가 비어있습니다.');
    }
    
    // 첫 번째 이미지 세트의 정답 데이터 테스트
    const firstSetId = imageSets[0].id;
    const answerData = await fetchAnswerPoints(firstSetId);
    if (!answerData || !answerData.regions) {
      throw new Error('정답 데이터 구조가 올바르지 않습니다.');
    }
    
    console.log('✅ API 연결 테스트 성공');
    return true;
    
  } catch (error) {
    console.error('❌ API 연결 테스트 실패:', error);
    return false;
  }
}

// 전역 접근을 위한 export (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchImageSets,
    fetchAnswerPoints,
    checkServerHealth,
    saveGameResult,
    testApiConnection
  };
} 