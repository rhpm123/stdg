/**
 * Supabase Storage 클라이언트 설정
 * 
 * 이미지 저장 및 관리를 위한 Supabase Storage 관련 유틸리티 함수들을 제공합니다.
 * 
 * @author Shrimp Task Manager
 * @version 0.2.0
 */

// supabase.js에서 서버 API 호출 함수와 버킷 상수 가져오기
import { listImages, uploadImage, deleteImage, getImageUrl, BUCKETS } from './supabase.js';

/**
 * 리사이즈된 이미지 URL 가져오기
 * @param {string} bucket - 버킷 이름
 * @param {string} path - 파일 경로
 * @param {number} width - 변환할 너비
 * @param {number} height - 변환할 높이
 * @param {string} format - 이미지 포맷 (기본: webp)
 * @returns {Promise<string>} - 변환된 이미지 URL
 */
export async function getResizedImageUrl(bucket, path, width, height, format = 'webp') {
  try {
    // 일반 이미지 URL 가져오기
    const imageUrl = await getImageUrl(bucket, path);
    
    // URL에 리사이징 파라미터 추가하기
    // 실제로는 이 작업이 서버에서 이루어지거나 Supabase의 변환 기능을 사용해야 함
    // 이 부분은 예시일 뿐이며, 실제 구현은 서버 측에서 해야 함
    
    // 리사이징 파라미터를 URL에 추가하는 방식은 서비스마다 다름
    const url = new URL(imageUrl);
    url.searchParams.append('width', width);
    url.searchParams.append('height', height);
    url.searchParams.append('format', format);
    
    return url.toString();
  } catch (error) {
    console.error('리사이즈 이미지 URL 가져오기 오류:', error);
    throw error;
  }
}

// 함수들 다시 내보내기 (supabase.js의 함수들을 그대로 사용)
export {
  uploadImage,
  listImages,
  deleteImage,
  getImageUrl,
  BUCKETS
} 